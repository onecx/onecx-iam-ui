import { Component, OnInit, ViewChild } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { finalize, map, of, Observable, catchError, tap } from 'rxjs'
import { DataView } from 'primeng/dataview'

import { Action, ColumnType, DataSortDirection, DataTableColumn } from '@onecx/angular-accelerator'

import {
  AdminInternalAPIService,
  Domain,
  Provider,
  ProvidersResponse,
  Role,
  RolePageResult,
  RoleSearchCriteria
} from 'src/app/shared/generated'
import { sortItemsByDisplayName } from 'src/app/shared/utils'

export interface RoleSearchCriteriaForm {
  name: FormControl<string | null>
  provider: FormControl<string | null>
  issuer: FormControl<string | null>
}

@Component({
  selector: 'app-role-search',
  templateUrl: './role-search.component.html',
  styleUrls: ['./role-search.component.scss'],
  standalone: false
})
export class RoleSearchComponent implements OnInit {
  private readonly filterFieldLabelKeys = ['ROLE.NAME', 'ROLE.DESCRIPTION']
  private rawSearchResults: Role[] | undefined = undefined
  // detail
  public exceptionKey: string | undefined
  public loading = false
  public displayDetailDialog = false
  public displayDeleteDialog = false
  // data
  public actions$: Observable<Action[]> | undefined
  public roles$!: Observable<Role[]> | undefined
  public viewMode: 'list' | 'grid' = 'grid'
  public filter: string | undefined
  public filterText = ''
  public sortField = 'name'
  public sortOrder = 1
  public sortColumns: DataTableColumn[] = []
  public sortColumnKeys: string[] = []
  public filterTooltip$: Observable<string>
  public searchCriteriaForm: FormGroup<RoleSearchCriteriaForm>
  public domains: Domain[] = []
  public provider$: Observable<Provider[]> | undefined

  @ViewChild(DataView) dv: DataView | undefined

  get sortDirectionEnum(): DataSortDirection {
    if (this.sortOrder === -1) return DataSortDirection.ASCENDING
    if (this.sortOrder === 1) return DataSortDirection.DESCENDING
    return DataSortDirection.NONE
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly iamAdminApi: AdminInternalAPIService,
    private readonly translate: TranslateService
  ) {
    this.filterTooltip$ = this.translate.stream(['ACTIONS.DATAVIEW.FILTER_OF', ...this.filterFieldLabelKeys]).pipe(
      map((translations) => {
        const fields = this.filterFieldLabelKeys.map((key) => translations[key]).join(', ')
        return `${translations['ACTIONS.DATAVIEW.FILTER_OF']}${fields}`
      })
    )
    this.searchCriteriaForm = new FormGroup<RoleSearchCriteriaForm>({
      name: new FormControl<string | null>(null),
      provider: new FormControl<string | null>(null, [Validators.required]),
      issuer: new FormControl<string | null>(null, [Validators.required])
    })
    this.sortColumns = [
      {
        columnType: ColumnType.STRING,
        nameKey: 'ROLE.NAME',
        id: 'name',
        sortable: true
      }
    ]
    this.sortColumnKeys = this.sortColumns.map((c) => c.id)
  }

  ngOnInit(): void {
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
    this.roles$ = of([])
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
  public onChangeDomain() {
    this.roles$ = of([])
  }

  public searchRoles() {
    this.loading = true
    this.exceptionKey = undefined
    // create criteria but exclude nulls and non-existings
    const rsc: RoleSearchCriteria = {
      issuer: '',
      ...Object.fromEntries(
        Object.entries(this.searchCriteriaForm.value).filter(([n, v]) => n !== 'provider' && v !== null)
      ),
      pageSize: 1000
    }
    if (!rsc.issuer) {
      this.exceptionKey = 'EXCEPTIONS.MISSING_ISSUER'
      return
    }
    this.filterText = ''
    this.rawSearchResults = undefined
    this.roles$ = this.iamAdminApi.searchRolesByCriteria({ roleSearchCriteria: rsc }).pipe(
      map((response: RolePageResult) => response.stream ?? []),
      tap((roles) => {
        this.rawSearchResults = roles
      }),
      catchError((err) => {
        this.exceptionKey = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.ROLES'
        console.error('searchRolesByCriteria', err)
        return of([])
      }),
      finalize(() => (this.loading = false))
    )
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
  public onLayoutChange(viewMode: 'list' | 'grid' | 'table'): void {
    // Filter out 'table' layout if not supported
    if (viewMode === 'table') return
    this.viewMode = viewMode
  }
  public onGlobalFilter(value: string): void {
    this.filterText = value
    this.filter = value
    if (this.rawSearchResults !== undefined) {
      this.roles$ = of(this.applyFilter(this.rawSearchResults, value))
    }
  }

  public onClearGlobalFilter(): void {
    this.filterText = ''
    this.filter = ''
    if (this.rawSearchResults !== undefined) {
      this.roles$ = of(this.rawSearchResults)
    }
  }

  private applyFilter(roles: Role[], filter: string): Role[] {
    if (!filter) return roles
    const f = filter.toLowerCase()
    return roles.filter((r) => r.name?.toLowerCase().includes(f) || r.description?.toLowerCase().includes(f))
  }

  public onFilterChange(filters: any): void {
    const currentFilter = filters?.toString() || ''
    this.filter = currentFilter
    // kept for compatibility with existing dataview emitted event
    if (!this.filterText) {
      this.filterText = currentFilter
    }
  }
  public onSortChange(sort: any): void {
    // sort can be a string (from old tests) or Sort object from InteractiveDataViewComponent { field, order }
    if (typeof sort === 'string') {
      this.sortField = sort
    } else {
      this.sortField = sort?.field || 'name'
    }
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
    this.searchCriteriaForm.reset()
    this.roles$ = of([])
    this.rawSearchResults = undefined
    this.filterText = ''
    this.filter = ''
  }
}
