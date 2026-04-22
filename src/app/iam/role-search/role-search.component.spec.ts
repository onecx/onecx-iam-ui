import { NO_ERRORS_SCHEMA } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { FormControl, FormGroup } from '@angular/forms'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { provideRouter, Router, ActivatedRoute } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { of, throwError, BehaviorSubject } from 'rxjs'

import { UserService } from '@onecx/angular-integration-interface'
import { DataSortDirection } from '@onecx/angular-accelerator'

import {
  AdminInternalAPIService,
  Domain,
  Provider,
  ProvidersResponse,
  Role,
  RolePageResult
} from 'src/app/shared/generated'
import { RoleSearchComponent, RoleSearchCriteriaForm } from './role-search.component'

const form = new FormGroup<RoleSearchCriteriaForm>({
  name: new FormControl<string | null>(null),
  provider: new FormControl<string | null>(null),
  issuer: new FormControl<string | null>(null)
})
const role1: Role = {
  name: 'name1',
  description: 'descr1'
}
const role2: Role = {
  name: 'name2',
  description: 'descr2'
}
const rolePageResult: RolePageResult = {
  totalElements: 1,
  number: 10,
  size: 10,
  totalPages: 2,
  stream: [role1]
}
const rolePageResult2: RolePageResult = {
  totalElements: 2,
  number: 10,
  size: 10,
  totalPages: 2,
  stream: [role1, role2]
}
const domain1: Domain = { name: 'domain1', displayName: 'IDM 1', issuer: 'http://keycloak' }
const domain2: Domain = { name: 'domain2', issuer: 'http://keycloak2' }
const provider1: Provider = {
  name: 'idm1',
  displayName: 'IDM 1',
  domains: [domain1]
}
const provider2: Provider = {
  name: 'idm2',
  domains: [domain1, domain2]
}

describe('RoleSearchComponent', () => {
  let component: RoleSearchComponent
  let fixture: ComponentFixture<RoleSearchComponent>
  const routerSpy = jasmine.createSpyObj('router', ['navigate'])
  const routeMock = { snapshot: { paramMap: new Map() } }

  const translateServiceSpy = jasmine.createSpyObj('TranslateService', ['get'])
  const adminApiSpy = {
    getAllProviders: jasmine.createSpy('getAllProviders').and.returnValue(of({})),
    searchRolesByCriteria: jasmine.createSpy('searchRolesByCriteria').and.returnValue(of({}))
  }
  const userServiceSpy = {
    lang$: new BehaviorSubject('en'),
    hasPermission: jasmine.createSpy('hasPermission').and.returnValue(Promise.resolve(false))
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RoleSearchComponent,
        TranslateTestingModule.withTranslations({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      providers: [
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: '', component: RoleSearchComponent }]),
        { provide: AdminInternalAPIService, useValue: adminApiSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(RoleSearchComponent, {
        set: {
          imports: [CommonModule, TranslateModule],
          schemas: [NO_ERRORS_SCHEMA],
          providers: [{ provide: AdminInternalAPIService, useValue: adminApiSpy }]
        }
      })
      .compileComponents()
    userServiceSpy.hasPermission.and.returnValue(Promise.resolve(false))
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleSearchComponent)
    component = fixture.componentInstance
    // fixture.detectChanges()
    fixture.componentInstance.ngOnInit() // solved ExpressionChangedAfterItHasBeenCheckedError
  })

  afterEach(() => {
    adminApiSpy.getAllProviders.calls.reset()
    adminApiSpy.searchRolesByCriteria.calls.reset()
    translateServiceSpy.get.calls.reset()
  })

  describe('initialize', () => {
    it('should create', () => {
      expect(component).toBeTruthy()
    })

    it('should call searchApps onSearch', () => {
      spyOn(component, 'searchRoles')

      component.onSearch()

      expect(component.searchRoles).toHaveBeenCalled()
    })
  })

  describe('search roles', () => {
    it('should call search but missing issuer', () => {
      component.searchCriteriaForm.reset()
      component.searchCriteriaForm.controls['name'].setValue(role1.name!)
      component.searchCriteriaForm.controls['provider'].setValue(provider1.name!)

      component.ngOnInit()
      component.onSearch()

      expect(component.exceptionKey).toBe('EXCEPTIONS.MISSING_ISSUER')
    })

    it('should search roles result stream list equals 1', (done) => {
      component.searchCriteriaForm.controls['name'].setValue('testname')
      component.searchCriteriaForm.controls['issuer'].setValue(domain1.issuer!)
      adminApiSpy.searchRolesByCriteria.and.returnValue(of(rolePageResult))

      component.ngOnInit()
      component.searchRoles()

      component.roles$?.subscribe({
        next: (roles) => {
          expect(roles.length).toBe(1)
          expect(roles[0]).toBe(role1)
          done()
        },
        error: done.fail
      })
    })

    it('should search roles result empty', (done) => {
      component.searchCriteriaForm.controls['name'].setValue('testname')
      component.searchCriteriaForm.controls['issuer'].setValue(domain1.issuer!)
      adminApiSpy.searchRolesByCriteria.and.returnValue(of({}))

      component.ngOnInit()
      component.searchRoles()

      component.roles$?.subscribe({
        next: (roles) => {
          expect(roles.length).toBe(0)
          done()
        },
        error: done.fail
      })
    })

    it('should search roles result stream list equals 2', (done) => {
      component.searchCriteriaForm.controls['name'].setValue('testname')
      component.searchCriteriaForm.controls['issuer'].setValue(domain1.issuer!)
      adminApiSpy.searchRolesByCriteria.and.returnValue(of(rolePageResult2))

      component.ngOnInit()
      component.searchRoles()

      component.roles$?.subscribe({
        next: (roles) => {
          expect(roles.length).toBe(2)
          expect(roles.at(0)).toEqual(role1)
          expect(roles.at(1)).toEqual(role2)
          done()
        },
        error: done.fail
      })

      component.roles$?.subscribe({
        next: (roles) => {
          expect(roles.length).toBe(2)
          expect(roles[0].name).toBe('name1')
        },
        error: done.fail
      })
    })

    it('should search roles Error response', (done) => {
      const errorResponse = { status: 404, statusText: 'Not Found' }
      component.searchCriteriaForm.controls['name'].setValue('testname')
      component.searchCriteriaForm.controls['issuer'].setValue(domain1.issuer!)
      adminApiSpy.searchRolesByCriteria.and.returnValue(throwError(() => errorResponse))
      spyOn(console, 'error')

      component.ngOnInit()
      component.searchRoles()

      component.roles$?.subscribe({
        next: (roles) => {
          expect(roles.length).toBe(0)
          expect(component.exceptionKey).toEqual('EXCEPTIONS.HTTP_STATUS_' + errorResponse.status + '.ROLES')
          expect(console.error).toHaveBeenCalledWith('searchRolesByCriteria', errorResponse)
          done()
        },
        error: done.fail
      })
    })
  })

  describe('search providers', () => {
    it('should search & found providers - successful with data', (done) => {
      const providerResponse: ProvidersResponse = {
        providers: [provider1, provider2]
      }
      adminApiSpy.getAllProviders.and.returnValue(of(providerResponse))

      component.searchProviders()

      component.provider$?.subscribe({
        next: (data) => {
          expect(data.length).toBe(2)
          done()
        },
        error: done.fail
      })
    })

    it('should search providers - successful without data', (done) => {
      const providerResponse: ProvidersResponse = {}
      adminApiSpy.getAllProviders.and.returnValue(of(providerResponse))

      component.searchProviders()

      component.provider$?.subscribe({
        next: (data) => {
          expect(data.length).toBe(0)
          done()
        },
        error: done.fail
      })
    })

    it('should search providers - error response', (done) => {
      const errorResponse = { status: 404, statusText: 'Not Found' }
      adminApiSpy.getAllProviders.and.returnValue(throwError(() => errorResponse))
      spyOn(console, 'error')

      component.searchProviders()

      component.provider$?.subscribe({
        next: (data) => {
          expect(data.length).toBe(0)
          expect(console.error).toHaveBeenCalledWith('getAllProviders', errorResponse)
          done()
        },
        error: done.fail
      })
    })
  })

  describe('change search criteria', () => {
    it('should reset domain - no provider selected', () => {
      component.domains = [domain1, domain2]

      component.onChangeProvider(undefined, [])

      expect(component.domains.length).toBe(0)
      expect(component.searchCriteriaForm?.controls['issuer'].value).toBeNull()
    })

    it('should refill domain from provider', () => {
      const provs = [provider1, provider2]

      component.onChangeProvider(provider2.name, provs)

      expect(component.domains.length).toBe(2)
    })

    it('should reset search results', (done) => {
      component.onChangeDomain()

      component.roles$?.subscribe({
        next: (data) => {
          expect(data.length).toBe(0)
          done()
        },
        error: done.fail
      })
    })
  })

  describe('filter', () => {
    it('should update filter and and sort Field', () => {
      const filter = 'testFilter'

      component.onFilterChange(filter)

      expect(component.filter).toBe(filter)

      component.onSortChange('field')

      expect(component.sortField).toBe('field')
    })

    it('should update viewMode onLayoutChange', () => {
      component.onLayoutChange('list')

      expect(component.viewMode).toBe('list')
    })

    it('should not change viewMode on table layout', () => {
      component.viewMode = 'grid'

      component.onLayoutChange('table' as any)

      expect(component.viewMode).toBe('grid')
    })

    it('should update filter and call dv.filter onFilterChange', () => {
      const filter = 'testFilter'

      component.onFilterChange(filter)

      expect(component.filter).toBe(filter)
    })

    it('should handle null filters in onFilterChange', () => {
      component.onFilterChange(null)

      expect(component.filter).toBe('')
    })

    it('should set filterText from onFilterChange when filterText is empty', () => {
      component.filterText = ''

      component.onFilterChange('newFilter')

      expect(component.filter).toBe('newFilter')
      expect(component.filterText).toBe('newFilter')
    })

    it('should not overwrite filterText from onFilterChange when filterText is set', () => {
      component.filterText = 'existingFilter'

      component.onFilterChange('newFilter')

      expect(component.filter).toBe('newFilter')
      expect(component.filterText).toBe('existingFilter')
    })
  })

  describe('global filter', () => {
    it('should filter roles by name on onGlobalFilter', (done) => {
      component['rawSearchResults'] = [role1, role2]

      component.onGlobalFilter('name1')

      expect(component.filterText).toBe('name1')
      expect(component.filter).toBe('name1')
      component.roles$?.subscribe({
        next: (roles) => {
          expect(roles.length).toBe(1)
          expect(roles[0]).toBe(role1)
          done()
        },
        error: done.fail
      })
    })

    it('should filter roles by description on onGlobalFilter', (done) => {
      component['rawSearchResults'] = [role1, role2]

      component.onGlobalFilter('descr2')

      component.roles$?.subscribe({
        next: (roles) => {
          expect(roles.length).toBe(1)
          expect(roles[0]).toBe(role2)
          done()
        },
        error: done.fail
      })
    })

    it('should return all roles on empty filter string', (done) => {
      component['rawSearchResults'] = [role1, role2]

      component.onGlobalFilter('')

      component.roles$?.subscribe({
        next: (roles) => {
          expect(roles.length).toBe(2)
          done()
        },
        error: done.fail
      })
    })

    it('should not update roles$ when rawSearchResults is undefined', () => {
      component['rawSearchResults'] = undefined
      component.roles$ = undefined

      component.onGlobalFilter('test')

      expect(component.filterText).toBe('test')
      expect(component.roles$).toBeUndefined()
    })

    it('should clear filter and restore all results on onClearGlobalFilter', (done) => {
      component['rawSearchResults'] = [role1, role2]
      component.filterText = 'name1'

      component.onClearGlobalFilter()

      expect(component.filterText).toBe('')
      expect(component.filter).toBe('')
      component.roles$?.subscribe({
        next: (roles) => {
          expect(roles.length).toBe(2)
          expect(roles[0]).toBe(role1)
          expect(roles[1]).toBe(role2)
          done()
        },
        error: done.fail
      })
    })

    it('should not update roles$ on onClearGlobalFilter when rawSearchResults is undefined', () => {
      component['rawSearchResults'] = undefined
      component.roles$ = undefined

      component.onClearGlobalFilter()

      expect(component.filterText).toBe('')
      expect(component.roles$).toBeUndefined()
    })
  })

  describe('sort', () => {
    it('should update sortOrder based on asc boolean onSortDirChange', () => {
      component.onSortDirChange(true)
      expect(component.sortOrder).toBe(-1)

      component.onSortDirChange(false)
      expect(component.sortOrder).toBe(1)
    })

    it('should update sortField from sort object with field property', () => {
      const sortObj = { field: 'description', order: 1 }

      component.onSortChange(sortObj)

      expect(component.sortField).toBe('description')
    })

    it('should default to name when sort object has no field', () => {
      const sortObj = { order: 1 }

      component.onSortChange(sortObj)

      expect(component.sortField).toBe('name')
    })

    it('should reset searchCriteriaForm, filter, and rawSearchResults on onSearchReset', () => {
      component.searchCriteriaForm = form
      component.filterText = 'testFilter'
      component.filter = 'testFilter'
      component['rawSearchResults'] = [role1, role2]
      spyOn(form, 'reset').and.callThrough()

      component.onSearchReset()

      expect(component.searchCriteriaForm.reset).toHaveBeenCalled()
      expect(component.filterText).toBe('')
      expect(component.filter).toBe('')
      expect(component['rawSearchResults']).toBeUndefined()
    })
  })

  describe('sortDirectionEnum', () => {
    it('should return ASCENDING when sortOrder is -1', () => {
      component.sortOrder = -1
      expect(component.sortDirectionEnum).toBe(DataSortDirection.ASCENDING)
    })

    it('should return DESCENDING when sortOrder is 1', () => {
      component.sortOrder = 1
      expect(component.sortDirectionEnum).toBe(DataSortDirection.DESCENDING)
    })

    it('should return NONE when sortOrder is 0', () => {
      component.sortOrder = 0
      expect(component.sortDirectionEnum).toBe(DataSortDirection.NONE)
    })
  })

  describe('filterTooltip$', () => {
    it('should emit a tooltip string with translated field names', (done) => {
      component.filterTooltip$.subscribe({
        next: (tooltip) => {
          expect(tooltip).toBeTruthy()
          expect(typeof tooltip).toBe('string')
          done()
        },
        error: done.fail
      })
    })
  })

  it('should navigate back onBack', () => {
    component.onBack()

    expect(routerSpy.navigate).toHaveBeenCalledWith(['../'], { relativeTo: routeMock })
  })

  it('should prepare action buttons with translated labels and tooltips', () => {
    spyOn(component, 'onBack')

    component.ngOnInit()

    if (component.actions$) {
      component.actions$.subscribe((actions) => {
        const firstAction = actions[0]
        firstAction.actionCallback()
        expect(component.onBack).toHaveBeenCalled()
      })
    }
  })
})
