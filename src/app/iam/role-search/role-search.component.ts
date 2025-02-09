import { Component, OnInit, ViewChild } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { finalize, map, of, Observable, catchError } from 'rxjs'
import { Action, DataViewControlTranslations } from '@onecx/portal-integration-angular'
import { DataView } from 'primeng/dataview'

import { Role, RolePageResult, RolesInternalAPIService } from 'src/app/shared/generated'

export interface RoleSearchCriteria {
  name: FormControl<string | null>
}

@Component({
  selector: 'app-role-search',
  templateUrl: './role-search.component.html',
  styleUrls: ['./role-search.component.scss']
})
export class RoleSearchComponent implements OnInit {
  public exceptionKey: string | undefined
  public loading = false

  public actions$: Observable<Action[]> | undefined
  public roles$!: Observable<Role[]>
  public rolesPageResult$!: Observable<RolePageResult>

  public viewMode: 'list' | 'grid' = 'grid'
  public filter: string | undefined
  public sortField = 'name'
  public sortOrder = 1
  public displayDetailDialog = false
  public displayDeleteDialog = false
  public roleSearchCriteriaGroup: FormGroup<RoleSearchCriteria>

  ngOnInit(): void {
    this.prepareDialogTranslations()
    this.prepareActionButtons()
    this.searchRoles()
  }

  public dataViewControlsTranslations: DataViewControlTranslations = {}
  @ViewChild(DataView) dv: DataView | undefined

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly rolesService: RolesInternalAPIService,
    private readonly translate: TranslateService
  ) {
    this.roleSearchCriteriaGroup = new FormGroup<RoleSearchCriteria>({
      name: new FormControl<string | null>(null)
    })
  }

  public searchRoles() {
    let name: string | undefined = undefined
    this.loading = true
    this.exceptionKey = undefined
    if (this.roleSearchCriteriaGroup.controls['name'] && this.roleSearchCriteriaGroup.controls['name'].value != '') {
      name = this.roleSearchCriteriaGroup.controls['name'].value ?? undefined
    }
    this.rolesPageResult$ = this.rolesService
      .searchRolesByCriteria({
        roleSearchCriteria: {
          name: name,
          pageSize: 1000
        }
      })
      .pipe(
        catchError((err) => {
          this.exceptionKey = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.ROLE'
          console.error('searchRolesByCriteria', err)
          return of({} as RolePageResult)
        }),
        finalize(() => (this.loading = false))
      )

    this.roles$ = this.rolesPageResult$.pipe(
      map((data) => {
        return data.stream as Role[]
      })
    )
  }

  /**
   * DIALOG
   */
  private prepareDialogTranslations() {
    this.translate
      .get(['ROLE.NAME', 'ROLE.DESCRIPTION', 'ACTIONS.DATAVIEW.FILTER_OF', 'ACTIONS.DATAVIEW.SORT_BY'])
      .pipe(
        map((data) => {
          this.dataViewControlsTranslations = {
            filterInputTooltip:
              data['ACTIONS.DATAVIEW.FILTER_OF'] + data['ROLE.NAME'] + ', ' + data['ROLE.DESCRIPTION'],
            sortDropdownTooltip: data['ACTIONS.DATAVIEW.SORT_BY'],
            sortDropdownPlaceholder: data['ACTIONS.DATAVIEW.SORT_BY']
          }
        })
      )
      .subscribe()
  }

  private prepareActionButtons(): void {
    this.actions$ = this.translate
      .get([
        'DIALOG.SEARCH.USER.LABEL',
        'DIALOG.SEARCH.USER.TOOLTIP',
        'ACTIONS.NAVIGATION.BACK',
        'ACTIONS.NAVIGATION.BACK.TOOLTIP'
      ])
      .pipe(
        map((data) => {
          return [
            {
              label: data['DIALOG.SEARCH.USER.LABEL'],
              title: data['DIALOG.SEARCH.USER.TOOLTIP'],
              actionCallback: () => this.onBack(),
              permission: 'USER#SEARCH',
              icon: 'pi pi-users',
              show: 'always'
            }
          ]
        })
      )
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

  onBack() {
    this.router.navigate(['../'], { relativeTo: this.route })
  }
  public onSearch() {
    this.searchRoles()
  }
  public onSearchReset() {
    this.roleSearchCriteriaGroup.reset()
  }
}
