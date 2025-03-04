import { Component, OnInit, ViewChild } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { finalize, map, of, Observable, Subject, catchError } from 'rxjs'
import { PrimeIcons } from 'primeng/api'
import { DataView } from 'primeng/dataview'

import { SlotService } from '@onecx/angular-remote-components'
import { UserService } from '@onecx/angular-integration-interface'
import { Action, DataViewControlTranslations, PortalDialogService } from '@onecx/portal-integration-angular'

import { limitText } from 'src/app/shared/utils'
import { User, UserPageResult, UsersInternalAPIService, UserSearchCriteria } from 'src/app/shared/generated'
import { UserPermissionsComponent } from '../user-permissions/user-permissions.component'

export interface UserSearchCriteriaForm {
  userName: FormControl<string | null>
  firstName: FormControl<string | null>
  lastName: FormControl<string | null>
  email: FormControl<string | null>
}

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.scss']
})
export class UserSearchComponent implements OnInit {
  private readonly destroy$ = new Subject()
  // dialog
  public loading = true
  public exceptionKey: string | undefined
  public displayDetailDialog = false
  public viewMode: 'list' | 'grid' = 'grid'
  public searchInProgress = false
  public filter: string | undefined
  public sortField = 'username'
  public sortOrder = 1
  public formGroup: FormGroup<UserSearchCriteriaForm>
  public limitText = limitText
  public userViewDetail = false // view permission?
  // data
  public actions$: Observable<Action[]> | undefined
  public users$!: Observable<User[]>
  public iamUser: User | undefined = undefined
  public permissionsSlotName = 'onecx-iam-user-permissions'
  public isComponentDefined$: Observable<boolean>

  @ViewChild(DataView) dv: DataView | undefined
  public dataViewControlsTranslations$: Observable<DataViewControlTranslations> | undefined

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly user: UserService,
    private readonly slotService: SlotService,
    private readonly portalDialogService: PortalDialogService,
    private readonly translate: TranslateService,
    private readonly userApi: UsersInternalAPIService
  ) {
    this.isComponentDefined$ = this.slotService.isSomeComponentDefinedForSlot(this.permissionsSlotName)
    this.userViewDetail = user.hasPermission('USER#VIEW')
    this.formGroup = new FormGroup<UserSearchCriteriaForm>({
      userName: new FormControl<string | null>(null),
      firstName: new FormControl<string | null>(null),
      lastName: new FormControl<string | null>(null),
      email: new FormControl<string | null>(null)
    })
  }

  ngOnInit(): void {
    this.prepareDialogTranslations()
    this.prepareActionButtons()
    this.searchUsers()
  }

  public searchUsers(): void {
    this.searchInProgress = true
    // cleanup forma data to usable search criteria: prevent empty strings
    const usc: UserSearchCriteria = {
      userName: this.formGroup.controls['userName'].value,
      firstName: this.formGroup.controls['firstName'].value,
      lastName: this.formGroup.controls['lastName'].value,
      email: this.formGroup.controls['email'].value,
      pageSize: 100
    } as UserSearchCriteria
    usc.userName = usc.userName === '' || usc.userName === null ? undefined : usc.userName
    usc.firstName = usc.firstName === '' || usc.firstName === null ? undefined : usc.firstName
    usc.lastName = usc.lastName === '' || usc.lastName === null ? undefined : usc.lastName
    usc.email = usc.email === '' || usc.email === null ? undefined : usc.email
    // execute search
    this.users$ = this.userApi.searchUsersByCriteria({ userSearchCriteria: usc }).pipe(
      map((response: UserPageResult) => {
        return response.stream ?? []
      }),
      catchError((err) => {
        this.exceptionKey = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.USER'
        console.error('searchUsersByCriteria', err)
        return of([] as User[])
      }),
      finalize(() => (this.searchInProgress = false))
    )
  }

  /**
   * DIALOG
   */
  private prepareDialogTranslations(): void {
    this.dataViewControlsTranslations$ = this.translate
      .get([
        'USER.USERNAME',
        'USER.LASTNAME',
        'USER.FIRSTNAME',
        'ACTIONS.DATAVIEW.FILTER_OF',
        'ACTIONS.DATAVIEW.SORT_BY'
      ])
      .pipe(
        map((data) => {
          return {
            filterInputTooltip:
              data['ACTIONS.DATAVIEW.FILTER_OF'] +
              data['USER.USERNAME'] +
              ', ' +
              data['USER.LASTNAME'] +
              ', ' +
              data['USER.FIRSTNAME'],
            sortDropdownTooltip: data['ACTIONS.DATAVIEW.SORT_BY'],
            sortDropdownPlaceholder: data['ACTIONS.DATAVIEW.SORT_BY']
          } as DataViewControlTranslations
        })
      )
  }

  private prepareActionButtons(): void {
    this.actions$ = this.translate.get(['DIALOG.SEARCH.ROLE.LABEL', 'DIALOG.SEARCH.ROLE.TOOLTIP']).pipe(
      map((data) => {
        return [
          {
            label: data['DIALOG.SEARCH.ROLE.LABEL'],
            title: data['DIALOG.SEARCH.ROLE.TOOLTIP'],
            actionCallback: () => this.onGoToRoleSearch(),
            permission: 'ROLE#SEARCH',
            icon: 'pi pi-bars',
            show: 'always'
          }
        ]
      })
    )
  }

  public prepareDisplayName(usr: User, l1: number, l2: number): string {
    let name = ''
    if (usr.firstName && !usr.lastName) name = usr.firstName
    if (!usr.firstName && usr.lastName) name = usr.lastName
    if (usr.firstName && usr.lastName) name = limitText(usr.firstName, l1) + ' ' + usr.lastName
    return limitText(name, l2)
  }

  /**
   * UI EVENTS
   */
  public onLayoutChange(viewMode: 'list' | 'grid'): void {
    this.viewMode = viewMode
  }
  public onFilterChange(filter: string): void {
    this.filter = filter
    this.dv?.filter(filter, 'contains')
  }
  public onSortChange(field: string): void {
    this.sortField = field
  }
  public onSortDirChange(asc: boolean): void {
    this.sortOrder = asc ? -1 : 1
  }

  public onGoToRoleSearch(): void {
    this.router.navigate(['./roles'], { relativeTo: this.route })
  }
  public onSearch(): void {
    this.searchUsers()
  }
  public onSearchReset(): void {
    this.formGroup.reset()
  }
  public onDetail(ev: Event, user: User): void {
    ev.stopPropagation()
    if (this.userViewDetail) {
      this.iamUser = user
      this.displayDetailDialog = true
    }
  }
  public onHideDetailDialog(): void {
    this.displayDetailDialog = false
  }

  public onUserPermissions(user: User, ev?: Event): void {
    ev?.stopPropagation()
    this.portalDialogService
      .openDialog(
        'DIALOG.PERMISSIONS.HEADER',
        {
          type: UserPermissionsComponent,
          inputs: { id: user.id, userId: user.id, displayName: user.username }
        },
        {
          id: 'iam_user_permissions_action_close',
          key: 'ACTIONS.CLOSE',
          icon: PrimeIcons.TIMES,
          tooltipKey: 'ACTIONS.CLOSE.TOOLTIP',
          tooltipPosition: 'top'
        },
        undefined,
        {
          modal: true,
          draggable: true,
          resizable: true,
          dismissableMask: true,
          maximizable: true,
          width: '900px'
        }
      )
      .subscribe(() => {})
  }
}
