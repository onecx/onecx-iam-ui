import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { Router, ActivatedRoute } from '@angular/router'
import { of } from 'rxjs'
import { TranslateTestingModule } from 'ngx-translate-testing'

import { RolesSearchComponent } from './roles-search.component'
import { Role, RolesInternalAPIService, RolePageResult } from 'src/app/shared/generated'

describe('RolesSearchComponent', () => {
  let component: RolesSearchComponent
  let fixture: ComponentFixture<RolesSearchComponent>
  let routerSpy = jasmine.createSpyObj('Router', ['navigate'])
  let routeMock = { snapshot: { paramMap: new Map() } }

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

  const translateServiceSpy = jasmine.createSpyObj('TranslateService', ['get'])
  const apiRoleServiceSpy = {
    searchRolesByCriteria: jasmine.createSpy('searchRolesByCriteria').and.returnValue(of({}))
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RolesSearchComponent],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      providers: [
        { provide: RolesInternalAPIService, useValue: apiRoleServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(RolesSearchComponent)
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
    component.rolesSearchCriteriaGroup.controls['name'].setValue('testname')
    apiRoleServiceSpy.searchRolesByCriteria.and.returnValue(of(rolePageResult as RolePageResult))

    component.searchRoles()

    component.rolesPageResult$.subscribe({
      next: (roles) => {
        expect(roles.stream?.length).toBe(1)
        expect(roles.stream?.at(0)).toBe(role)
        done()
      },
      error: done.fail
    })
  })

  it('should search roles result empty', (done) => {
    component.rolesSearchCriteriaGroup.controls['name'].setValue('testname')
    apiRoleServiceSpy.searchRolesByCriteria.and.returnValue(of({} as RolePageResult))

    component.searchRoles()

    component.rolesPageResult$.subscribe({
      next: (roles) => {
        expect(roles.stream?.length).toBeUndefined()
        done()
      },
      error: done.fail
    })
  })

  it('should search roles result stream list equals 2', (done) => {
    component.rolesSearchCriteriaGroup.controls['name'].setValue('testname')
    apiRoleServiceSpy.searchRolesByCriteria.and.returnValue(of(rolePageResult2 as RolePageResult))

    component.searchRoles()

    component.rolesPageResult$.subscribe({
      next: (roles) => {
        expect(roles.stream?.length).toBe(2)
        expect(roles.stream?.at(0)).toBe(role)
        expect(roles.stream?.at(1)).toBe(role2)
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
})
