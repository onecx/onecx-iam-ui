import { Component, OnInit, ViewChild } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { finalize, map, of, Observable, Subject, catchError } from 'rxjs'
import { PrimeIcons } from 'primeng/api'
import { DataView } from 'primeng/dataview'

import { SlotService } from '@onecx/angular-remote-components'
import { UserService } from '@onecx/angular-integration-interface'
import { Action, DataViewControlTranslations, PortalDialogService } from '@onecx/portal-integration-angular'

import { limitText, sortItemsByDisplayName } from 'src/app/shared/utils'
import {
  AdminInternalAPIService,
  Domain,
  Provider,
  ProvidersResponse,
  User,
  UserPageResult,
  UserSearchCriteria
} from 'src/app/shared/generated'
import { UserPermissionsComponent } from '../user-permissions/user-permissions.component'

export interface UserSearchCriteriaForm {
  userId: FormControl<string | null>
  userName: FormControl<string | null>
  firstName: FormControl<string | null>
  lastName: FormControl<string | null>
  email: FormControl<string | null>
  provider: FormControl<string | null>
  issuer: FormControl<string | null>
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
  public filter: string | undefined
  public sortField = 'username'
  public sortOrder = 1
  public searchCriteriaForm: FormGroup<UserSearchCriteriaForm>
  public domains: Domain[] = []
  public limitText = limitText
  public userViewPermission = false // view permission?
  // data
  public actions$: Observable<Action[]> | undefined
  public users$: Observable<User[]> | undefined
  public provider$: Observable<Provider[]> | undefined
  public idmUser: User | undefined = undefined
  public idmUserIssuer: string | undefined = undefined
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
    private readonly iamAdminApi: AdminInternalAPIService
  ) {
    this.isComponentDefined$ = this.slotService.isSomeComponentDefinedForSlot(this.permissionsSlotName)
    this.userViewPermission = user.hasPermission('USER#VIEW')
    this.searchCriteriaForm = new FormGroup<UserSearchCriteriaForm>({
      userId: new FormControl<string | null>(null),
      userName: new FormControl<string | null>(null),
      firstName: new FormControl<string | null>(null),
      lastName: new FormControl<string | null>(null),
      email: new FormControl<string | null>(null),
      provider: new FormControl<string | null>(null, [Validators.required]),
      issuer: new FormControl<string | null>(null, [Validators.required])
    })
  }

  ngOnInit(): void {
    this.prepareDialogTranslations()
    this.prepareActionButtons()
    this.searchProviders()
  }

  /* SEARCH CRITERIA => provider, domain => issuer
   */
  public searchProviders(): void {
    this.loading = true
    this.exceptionKey = undefined
    this.provider$ = this.iamAdminApi.getAllProviders().pipe(
      map((response: ProvidersResponse) => {
        const provs: Provider[] = []
        response.providers?.forEach((p) => provs.push({ ...p, displayName: p.displayName ?? p.name }))
        return provs.sort(sortItemsByDisplayName)
      }),
      catchError((err) => {
        this.exceptionKey = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.PROVIDER'
        console.error('getAllProviders', err)
        return of([])
      }),
      finalize(() => (this.loading = false))
    )
  }
  // load appId dropdown with app ids from product
  public onChangeProvider(name: string | undefined, provider: Provider[]) {
    this.domains = []
    this.searchCriteriaForm.controls['issuer'].setValue(null)
    if (!name) return
    provider
      .filter((p) => p.name === name)
      .forEach((p) => {
        p.domains?.forEach((d) => {
          this.domains.push({ ...d, displayName: d.displayName ?? d.name })
        })
      })
    this.domains.sort(sortItemsByDisplayName)
  }

  /* SEARCH
   */
  public searchUsers(): void {
    this.exceptionKey = undefined
    // create criteria but exclude nulls and non-existings
    let usc: UserSearchCriteria = {
      issuer: '',
      ...Object.fromEntries(
        Object.entries(this.searchCriteriaForm.value).filter(([n, v]) => n !== 'provider' && v !== null)
      ),
      pageSize: 1000
    }
    if (!usc.issuer) {
      this.exceptionKey = 'EXCEPTIONS.MISSING_ISSUER.USER'
      return
    }
    // shrink criteria if user id is used
    if (usc.userId) usc = { userId: usc.userId, issuer: usc.issuer, pageSize: usc.pageSize }

    this.loading = true
    this.users$ = this.iamAdminApi.searchUsersByCriteria({ userSearchCriteria: usc }).pipe(
      map((response: UserPageResult) => response.stream ?? []),
      catchError((err) => {
        this.exceptionKey = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.USER'
        console.error('searchUsersByCriteria', err)
        return of([])
      }),
      finalize(() => (this.loading = false))
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
  public searchOnlyById(val: string) {
    if (val) {
      this.searchCriteriaForm.disable()
      this.searchCriteriaForm.controls['userId'].enable()
      this.searchCriteriaForm.controls['issuer'].enable()
    }
  }
  public onSearchReset(): void {
    this.searchCriteriaForm.reset()
    this.searchCriteriaForm.enable()
    this.users$ = of([])
  }

  public onDetail(ev: Event, user: User): void {
    if (!user) return
    ev.stopPropagation()
    if (this.userViewPermission) {
      this.idmUser = user
      this.idmUserIssuer = this.domains.find((d) => (d.name = user.domain))?.issuer
      this.displayDetailDialog = true
    }
  }
  public onHideDetailDialog(): void {
    this.displayDetailDialog = false
  }

  public onUserPermissions(ev: Event, user: User): void {
    if (!user) return
    ev.stopPropagation()
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
