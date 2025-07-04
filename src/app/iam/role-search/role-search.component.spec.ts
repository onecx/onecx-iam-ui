import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { FormControl, FormGroup } from '@angular/forms'
import { provideRouter, Router, ActivatedRoute } from '@angular/router'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { of, throwError } from 'rxjs'

import { UserService } from '@onecx/angular-integration-interface'

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
  const userServiceSpy = { hasPermission: jasmine.createSpy('hasPermission').and.returnValue(of()) }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RoleSearchComponent],
      imports: [
        TranslateTestingModule.withTranslations({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: '', component: RoleSearchComponent }]),
        { provide: AdminInternalAPIService, useValue: adminApiSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents()
    userServiceSpy.hasPermission.and.returnValue(false)
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

    it('should search providers - successful without data', (done) => {
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

    it('should update filter and call dv.filter onFilterChange', () => {
      const filter = 'testFilter'

      component.onFilterChange(filter)

      expect(component.filter).toBe(filter)
    })
  })

  describe('sort', () => {
    it('should update sortOrder based on asc boolean onSortDirChange', () => {
      component.onSortDirChange(true)
      expect(component.sortOrder).toBe(-1)

      component.onSortDirChange(false)
      expect(component.sortOrder).toBe(1)
    })

    it('should reset searchCriteriaForm onSearchReset is called', () => {
      component.searchCriteriaForm = form
      spyOn(form, 'reset').and.callThrough()

      component.onSearchReset()

      expect(component.searchCriteriaForm.reset).toHaveBeenCalled()
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
