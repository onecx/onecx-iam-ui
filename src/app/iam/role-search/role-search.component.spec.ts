import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { FormControl, FormGroup } from '@angular/forms'
import { provideRouter, Router, ActivatedRoute } from '@angular/router'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { of, throwError } from 'rxjs'

import { UserService } from '@onecx/angular-integration-interface'

import { Role, RolesInternalAPIService, RolePageResult } from 'src/app/shared/generated'
import { RoleSearchComponent, RoleSearchCriteria } from './role-search.component'

const form = new FormGroup<RoleSearchCriteria>({
  name: new FormControl<string | null>(null)
})
const role: Role = {
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
  stream: [role]
}
const rolePageResult2: RolePageResult = {
  totalElements: 2,
  number: 10,
  size: 10,
  totalPages: 2,
  stream: [role, role2]
}

describe('RoleSearchComponent', () => {
  let component: RoleSearchComponent
  let fixture: ComponentFixture<RoleSearchComponent>
  const routerSpy = jasmine.createSpyObj('router', ['navigate'])
  const routeMock = { snapshot: { paramMap: new Map() } }

  const translateServiceSpy = jasmine.createSpyObj('TranslateService', ['get'])
  const apiRoleServiceSpy = {
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
        { provide: RolesInternalAPIService, useValue: apiRoleServiceSpy },
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
    apiRoleServiceSpy.searchRolesByCriteria.calls.reset()
    translateServiceSpy.get.calls.reset()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should call searchApps onSearch', () => {
    spyOn(component, 'searchRoles')

    component.onSearch()

    expect(component.searchRoles).toHaveBeenCalled()
  })

  it('should search roles result stream list equals 1', (done) => {
    component.roleSearchCriteriaGroup.controls['name'].setValue('testname')
    apiRoleServiceSpy.searchRolesByCriteria.and.returnValue(of(rolePageResult))

    component.searchRoles()

    component.roles$.subscribe({
      next: (roles) => {
        expect(roles.length).toBe(1)
        expect(roles[0]).toBe(role)
        done()
      },
      error: done.fail
    })
  })

  it('should search roles result empty', (done) => {
    component.roleSearchCriteriaGroup.controls['name'].setValue('testname')
    apiRoleServiceSpy.searchRolesByCriteria.and.returnValue(of({}))

    component.searchRoles()

    component.roles$.subscribe({
      next: (roles) => {
        expect(roles.length).toBe(0)
        done()
      },
      error: done.fail
    })
  })

  it('should search roles result stream list equals 2', (done) => {
    component.roleSearchCriteriaGroup.controls['name'].setValue('testname')
    apiRoleServiceSpy.searchRolesByCriteria.and.returnValue(of(rolePageResult2))

    component.searchRoles()

    component.roles$.subscribe({
      next: (roles) => {
        expect(roles.length).toBe(2)
        expect(roles.at(0)).toBe(role)
        expect(roles.at(1)).toBe(role2)
        done()
      },
      error: done.fail
    })

    component.roles$.subscribe({
      next: (roles) => {
        expect(roles.length).toBe(2)
        expect(roles[0].name).toBe('name1')
      },
      error: done.fail
    })
  })

  it('should search roles Error response', (done) => {
    const errorResponse = { status: 404, statusText: 'Not Found' }
    component.roleSearchCriteriaGroup.controls['name'].setValue('testname')
    apiRoleServiceSpy.searchRolesByCriteria.and.returnValue(throwError(() => errorResponse))
    spyOn(console, 'error')

    component.searchRoles()

    component.roles$.subscribe({
      next: (roles) => {
        expect(roles.length).toBe(0)
        expect(component.exceptionKey).toEqual('EXCEPTIONS.HTTP_STATUS_' + errorResponse.status + '.ROLES')
        expect(console.error).toHaveBeenCalledWith('searchRolesByCriteria', errorResponse)
        done()
      },
      error: done.fail
    })
  })

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

  it('should update sortOrder based on asc boolean onSortDirChange', () => {
    component.onSortDirChange(true)
    expect(component.sortOrder).toBe(-1)

    component.onSortDirChange(false)
    expect(component.sortOrder).toBe(1)
  })

  it('should reset roleSearchCriteriaGroup onSearchReset is called', () => {
    component.roleSearchCriteriaGroup = form
    spyOn(form, 'reset').and.callThrough()

    component.onSearchReset()

    expect(component.roleSearchCriteriaGroup.reset).toHaveBeenCalled()
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
