import { Component, OnInit, ViewChild } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'

import { finalize, map, of, Observable, Subject, catchError } from 'rxjs'
import { Action, DataViewControlTranslations } from '@onecx/portal-integration-angular'
import { DataView } from 'primeng/dataview'

import { limitText } from 'src/app/shared/utils'
import { User, UserPageResult, UsersInternalAPIService } from 'src/app/shared/generated'

export interface UserSearchCriteria {
  criteria: FormControl<string | null>
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
  public displayDetailDialog = false
  public displayDeleteDialog = false
  public hasCreatePermission = false
  public hasEditPermission = false
  public hasDeletePermission = false
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
      criteria: new FormControl<string | null>(null)
    })
  }

  public searchUsers() {
    let queryString: string | undefined = this.formGroup.controls['criteria']
      ? this.formGroup.controls['criteria'].value!
      : undefined
    this.usersPageResult$ = this.userService
      .searchUsersByCriteria({
        userSearchCriteria: {
          query: queryString
        }
      })
      .pipe(
        catchError((err) => {
          this.exceptionKey = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.APPS'
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
  private prepareDialogTranslations(): void {
    this.translate
      .get([
        'USER.USERNAME',
        'USER.LASTNAME',
        'USER.FIRSTNAME',
        'ACTIONS.DATAVIEW.SORT_BY',
        'ACTIONS.DATAVIEW.FILTER',
        'ACTIONS.DATAVIEW.FILTER_OF',
        'ACTIONS.DATAVIEW.VIEW_MODE_GRID',
        'ACTIONS.DATAVIEW.VIEW_MODE_LIST',
        'ACTIONS.DATAVIEW.SORT_DIRECTION_ASC',
        'ACTIONS.DATAVIEW.SORT_DIRECTION_DESC'
      ])
      .subscribe((data) => {
        this.dataViewControlsTranslations = {
          sortDropdownPlaceholder: data['ACTIONS.DATAVIEW.SORT_BY'],
          filterInputPlaceholder: data['ACTIONS.DATAVIEW.FILTER'],
          filterInputTooltip:
            data['ACTIONS.DATAVIEW.FILTER_OF'] +
            data['USER.USERNAME'] +
            ', ' +
            data['USER.LASTNAME'] +
            ', ' +
            data['USER.FIRSTNAME'],
          viewModeToggleTooltips: {
            grid: data['ACTIONS.DATAVIEW.VIEW_MODE_GRID'],
            list: data['ACTIONS.DATAVIEW.VIEW_MODE_LIST']
          },
          sortOrderTooltips: {
            ascending: data['ACTIONS.DATAVIEW.SORT_DIRECTION_ASC'],
            descending: data['ACTIONS.DATAVIEW.SORT_DIRECTION_DESC']
          },
          sortDropdownTooltip: data['ACTIONS.DATAVIEW.SORT_BY']
        }
      })
  }

  private prepareActionButtons(): void {
    this.actions$ = this.translate.get(['DIALOG.SEARCH.ROLE.LABEL', 'DIALOG.SEARCH.ROLE.TOOLTIP']).pipe(
      map((data) => {
        return [
          {
            label: data['DIALOG.SEARCH.ROLE.LABEL'],
            title: data['DIALOG.SEARCH.ROLE.TOOLTIP'],
            actionCallback: () => this.onRoleSearch(),
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

  onRoleSearch() {
    this.router.navigate(['./roles'], { relativeTo: this.route })
  }

  public onSearch() {
    this.searchUsers()
  }
  public onSearchReset() {
    this.formGroup.reset()
  }
}
