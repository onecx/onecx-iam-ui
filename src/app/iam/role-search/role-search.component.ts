import { Component, OnInit, ViewChild } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { finalize, map, of, Observable, catchError } from 'rxjs'
import { Action, DataViewControlTranslations } from '@onecx/portal-integration-angular'
import { DataView } from 'primeng/dataview'

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
  styleUrls: ['./role-search.component.scss']
})
export class RoleSearchComponent implements OnInit {
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
  public sortField = 'name'
  public sortOrder = 1
  public searchCriteriaForm: FormGroup<RoleSearchCriteriaForm>
  public domains: Domain[] = []
  public provider$: Observable<Provider[]> | undefined

  public dataViewControlsTranslations: DataViewControlTranslations = {}
  @ViewChild(DataView) dv: DataView | undefined

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly iamAdminApi: AdminInternalAPIService,
    private readonly translate: TranslateService
  ) {
    this.searchCriteriaForm = new FormGroup<RoleSearchCriteriaForm>({
      name: new FormControl<string | null>(null),
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
    if (!this.searchCriteriaForm.controls['issuer'].value) return
    this.loading = true
    this.exceptionKey = undefined
    const criteria: RoleSearchCriteria = {
      name: this.searchCriteriaForm.controls['name'].value ?? undefined,
      issuer: this.searchCriteriaForm.controls['issuer'].value,
      pageSize: 1000
    }
    this.roles$ = this.iamAdminApi.searchRolesByCriteria({ roleSearchCriteria: criteria }).pipe(
      map((response: RolePageResult) => response.stream ?? []),
      catchError((err) => {
        this.exceptionKey = 'EXCEPTIONS.HTTP_STATUS_' + err.status + '.ROLES'
        console.error('searchRolesByCriteria', err)
        return of([])
      }),
      finalize(() => (this.loading = false))
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
    this.searchCriteriaForm.reset()
  }
}
