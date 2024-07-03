import { Component, OnInit, ViewChild } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { finalize, map, of, Observable, Subject, catchError } from 'rxjs'
import { DataView } from 'primeng/dataview'

import { Action, DataViewControlTranslations } from '@onecx/portal-integration-angular'

import { limitText } from 'src/app/shared/utils'
import { User, UserPageResult, UsersInternalAPIService } from 'src/app/shared/generated'

export interface UserSearchCriteria {
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
  private readonly debug = true // to be removed after finalization
  public exceptionKey: string | undefined
  public loading = true

  public actions$: Observable<Action[]> | undefined
  public users$!: Observable<User[]>
  public usersPageResult$!: Observable<UserPageResult>

  public viewMode = 'grid'
  public searchInProgress = false
  public filter: string | undefined
  public sortField = 'username'
  public sortOrder = 1
  public formGroup: FormGroup<UserSearchCriteria>
  public limitText = limitText

  ngOnInit(): void {
    this.prepareDialogTranslations()
    this.prepareActionButtons()
    this.searchUsers()
  }

  public dataViewControlsTranslations: DataViewControlTranslations = {}
  @ViewChild(DataView) dv: DataView | undefined

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UsersInternalAPIService,
    private translate: TranslateService
  ) {
    this.formGroup = new FormGroup<UserSearchCriteria>({
      userName: new FormControl<string | null>(null),
      firstName: new FormControl<string | null>(null),
      lastName: new FormControl<string | null>(null),
      email: new FormControl<string | null>(null)
    })
  }

  public searchUsers() {
    this.usersPageResult$ = this.userService
      .searchUsersByCriteria({
        userSearchCriteria: {
          userName: this.formGroup.controls['userName'].value || undefined,
          firstName: this.formGroup.controls['firstName'].value || undefined,
          lastName: this.formGroup.controls['lastName'].value || undefined,
          email: this.formGroup.controls['email'].value || undefined
        }
      })
      .pipe(
        catchError((err) => {
          this.exceptionKey = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.USER'
          console.error('searchUsers():', err)
          return of({} as UserPageResult)
        }),
        finalize(() => (this.searchInProgress = false))
      )

    this.users$ = this.usersPageResult$.pipe(
      map((data) => {
        return data.stream as User[]
      })
    )
  }

  /**
   * DIALOG
   */
  private prepareDialogTranslations() {
    this.translate
      .get([
        'USER.USERNAME',
        'USER.LASTNAME',
        'USER.FIRSTNAME',
        'ACTIONS.DATAVIEW.FILTER_OF',
        'ACTIONS.DATAVIEW.SORT_BY'
      ])
      .pipe(
        map((data) => {
          this.dataViewControlsTranslations = {
            filterInputTooltip:
              data['ACTIONS.DATAVIEW.FILTER_OF'] +
              data['USER.USERNAME'] +
              ', ' +
              data['USER.LASTNAME'] +
              ', ' +
              data['USER.FIRSTNAME'],
            sortDropdownTooltip: data['ACTIONS.DATAVIEW.SORT_BY'],
            sortDropdownPlaceholder: data['ACTIONS.DATAVIEW.SORT_BY']
          }
        })
      )
      .subscribe()
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

  /**
   * UI EVENTS
   */
  public onLayoutChange(viewMode: string): void {
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

  public onGoToRoleSearch() {
    this.router.navigate(['./roles'], { relativeTo: this.route })
  }
  public onSearch() {
    this.searchUsers()
  }
  public onSearchReset() {
    this.formGroup.reset()
  }
}
