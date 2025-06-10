import { TestBed } from '@angular/core/testing'
import { CommonModule } from '@angular/common'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { of, ReplaySubject, throwError } from 'rxjs'

import { BASE_URL, RemoteComponentConfig } from '@onecx/angular-remote-components'

import { AdminInternalAPIService, RolePageResult, UserRolesResponse } from 'src/app/shared/generated'
import { OneCXIamUserRolesComponent } from './iam-user-roles.component'

describe('OneCXIamUserRolesComponent', () => {
  const roleApiSpy = {
    getUserRoles: jasmine.createSpy('getUserRoles').and.returnValue(of({})),
    searchRolesByCriteria: jasmine.createSpy('searchRolesByCriteria').and.returnValue(of({}))
  }

  function setUp() {
    const fixture = TestBed.createComponent(OneCXIamUserRolesComponent)
    const component = fixture.componentInstance
    fixture.detectChanges()
    return { fixture, component }
  }

  let baseUrlSubject: ReplaySubject<any>
  beforeEach(() => {
    baseUrlSubject = new ReplaySubject<any>(1)
    TestBed.configureTestingModule({
      declarations: [],
      imports: [
        TranslateTestingModule.withTranslations({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        }).withDefaultLanguage('en'),
        NoopAnimationsModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: BASE_URL,
          useValue: baseUrlSubject
        }
      ]
    })
      .overrideComponent(OneCXIamUserRolesComponent, {
        set: {
          imports: [TranslateTestingModule, CommonModule],
          providers: [{ provide: AdminInternalAPIService, useValue: roleApiSpy }]
        }
      })
      .compileComponents()

    baseUrlSubject.next('base_url_mock')
    roleApiSpy.getUserRoles.calls.reset()
    roleApiSpy.searchRolesByCriteria.calls.reset()
  })

  describe('initialize', () => {
    it('should create', () => {
      const { component } = setUp()

      expect(component).toBeTruthy()
    })

    it('should call ocxInitRemoteComponent with the correct config', () => {
      const { component } = setUp()
      const mockConfig: RemoteComponentConfig = {
        appId: 'appId',
        productName: 'prodName',
        permissions: ['permission'],
        baseUrl: 'base'
      }
      spyOn(component, 'ocxInitRemoteComponent')

      component.ocxRemoteComponentConfig = mockConfig

      expect(component.ocxInitRemoteComponent).toHaveBeenCalledWith(mockConfig)
    })

    it('should init remote component', (done: DoneFn) => {
      const { component } = setUp()

      component.ocxInitRemoteComponent({ baseUrl: 'base_url' } as RemoteComponentConfig)

      baseUrlSubject.asObservable().subscribe((item) => {
        expect(item).toEqual('base_url')
        done()
      })
    })
  })

  describe('getting roles for user', () => {
    it('should get roles - successful with data', () => {
      const { component } = setUp()
      component.userId = 'user'
      const mockResponse: UserRolesResponse = { roles: [{ name: 'role1' }, { name: 'role2' }] }
      roleApiSpy.getUserRoles.and.returnValue(of(mockResponse))
      spyOn(component.roleList, 'emit')

      component.ngOnChanges()

      expect(component.roleList.emit).toHaveBeenCalled()
    })

    it('should get roles - successful without data', () => {
      const { component } = setUp()
      component.userId = 'user'
      const mockResponse: string[] = []
      roleApiSpy.getUserRoles.and.returnValue(of(mockResponse))
      spyOn(component.roleList, 'emit')

      component.ngOnChanges()

      expect(component.roleList.emit).toHaveBeenCalledWith([])
    })

    it('should get roles - failed', () => {
      const { component } = setUp()
      component.userId = 'user'
      const errorResponse = { status: 400, statusText: 'Error on getting roles' }
      roleApiSpy.getUserRoles.and.returnValue(throwError(() => errorResponse))
      spyOn(component.roleList, 'emit')
      spyOn(console, 'error')

      component.ngOnChanges()

      expect(component.roleList.emit).toHaveBeenCalledWith([])
      expect(console.error).toHaveBeenCalledWith('iam.getUserRoles', errorResponse)
    })
  })

  describe('no user id', () => {
    it('should get empty role array', () => {
      const { component } = setUp()
      component.userId = undefined
      spyOn(component.roleList, 'emit')

      component.ngOnChanges()

      expect(component.roleList.emit).toHaveBeenCalled()
    })
  })

  describe('getting all roles', () => {
    it('should get roles - successful with data', () => {
      const { component } = setUp()
      component.userId = '$$ocx-iam-roles-search-all-indicator$$'
      const mockResponse: RolePageResult = { stream: [{ name: 'role1' }, { name: 'role2' }] }
      roleApiSpy.searchRolesByCriteria.and.returnValue(of(mockResponse))
      spyOn(component.roleList, 'emit')

      component.ngOnChanges()

      expect(component.roleList.emit).toHaveBeenCalled()
    })

    it('should get roles - successful without data', () => {
      const { component } = setUp()
      component.userId = '$$ocx-iam-roles-search-all-indicator$$'
      const mockResponse: RolePageResult = { stream: [] }
      roleApiSpy.searchRolesByCriteria.and.returnValue(of(mockResponse))
      spyOn(component.roleList, 'emit')

      component.ngOnChanges()

      expect(component.roleList.emit).toHaveBeenCalledWith([])
    })

    it('should get roles - successful without stream', () => {
      const { component } = setUp()
      component.userId = '$$ocx-iam-roles-search-all-indicator$$'
      const mockResponse: RolePageResult = { stream: undefined }
      roleApiSpy.searchRolesByCriteria.and.returnValue(of(mockResponse))
      spyOn(component.roleList, 'emit')

      component.ngOnChanges()

      expect(component.roleList.emit).toHaveBeenCalledWith([])
    })

    it('should get roles- failed', () => {
      const { component } = setUp()
      component.userId = '$$ocx-iam-roles-search-all-indicator$$'
      const errorResponse = { status: 400, statusText: 'Error on getting roles' }
      roleApiSpy.searchRolesByCriteria.and.returnValue(throwError(() => errorResponse))
      spyOn(component.roleList, 'emit')
      spyOn(console, 'error')

      component.ngOnChanges()

      expect(component.roleList.emit).toHaveBeenCalledWith([])
      expect(console.error).toHaveBeenCalledWith('iam.searchRolesByCriteria', errorResponse)
    })
  })

  describe('sortByRoleName', () => {
    it('should return negative value when first role name comes before second alphabetically', () => {
      const { component } = setUp()
      const roleA = { name: 'Admin' }
      const roleB = { name: 'User' }
      expect(component.sortByRoleName(roleA, roleB)).toBeLessThan(0)
    })

    it('should return positive value when first role name comes after second alphabetically', () => {
      const { component } = setUp()
      const roleA = { name: 'User' }
      const roleB = { name: 'Admin' }
      expect(component.sortByRoleName(roleA, roleB)).toBeGreaterThan(0)
    })

    it('should return zero when role names are the same', () => {
      const { component } = setUp()
      const roleA = { name: 'Admin' }
      const roleB = { name: 'Admin' }
      expect(component.sortByRoleName(roleA, roleB)).toBe(0)
    })

    it('should be case-insensitive', () => {
      const { component } = setUp()
      const roleA = { name: 'admin' }
      const roleB = { name: 'Admin' }
      expect(component.sortByRoleName(roleA, roleB)).toBe(0)
    })

    it('should handle undefined names', () => {
      const { component } = setUp()
      const roleA = { name: undefined }
      const roleB = { name: 'Admin' }
      expect(component.sortByRoleName(roleA, roleB)).toBeLessThan(0)
    })

    it('should handle empty string names', () => {
      const { component } = setUp()
      const roleA = { name: '' }
      const roleB = { name: 'Admin' }
      expect(component.sortByRoleName(roleA, roleB)).toBeLessThan(0)
    })

    it('should handle both names being undefined', () => {
      const { component } = setUp()
      const roleA = { name: undefined }
      const roleB = { name: undefined }
      expect(component.sortByRoleName(roleA, roleB)).toBe(0)
    })
  })
})
