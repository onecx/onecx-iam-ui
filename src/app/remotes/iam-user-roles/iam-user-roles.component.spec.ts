import { TestBed } from '@angular/core/testing'
import { CommonModule } from '@angular/common'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { of, ReplaySubject, throwError } from 'rxjs'

import { BASE_URL, RemoteComponentConfig } from '@onecx/angular-remote-components'

import { RolesInternalAPIService, RolePageResult, UserRolesResponse } from 'src/app/shared/generated'
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
          providers: [{ provide: RolesInternalAPIService, useValue: roleApiSpy }]
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

  describe('getting all roles', () => {
    it('should get roles - successful with data', () => {
      const { component } = setUp()
      component.userId = undefined
      const mockResponse: RolePageResult = { stream: [{ name: 'role1' }, { name: 'role2' }] }
      roleApiSpy.searchRolesByCriteria.and.returnValue(of(mockResponse))
      spyOn(component.roleList, 'emit')

      component.ngOnChanges()

      expect(component.roleList.emit).toHaveBeenCalled()
    })

    it('should get roles - successful without data', () => {
      const { component } = setUp()
      component.userId = undefined
      const mockResponse: RolePageResult = { stream: [] }
      roleApiSpy.searchRolesByCriteria.and.returnValue(of(mockResponse))
      spyOn(component.roleList, 'emit')

      component.ngOnChanges()

      expect(component.roleList.emit).toHaveBeenCalledWith([])
    })

    it('should get roles - failed', () => {
      const { component } = setUp()
      component.userId = undefined
      const errorResponse = { status: 400, statusText: 'Error on getting roles' }
      roleApiSpy.searchRolesByCriteria.and.returnValue(throwError(() => errorResponse))
      spyOn(component.roleList, 'emit')
      spyOn(console, 'error')

      component.ngOnChanges()

      expect(component.roleList.emit).toHaveBeenCalledWith([])
      expect(console.error).toHaveBeenCalledWith('iam.searchRolesByCriteria', errorResponse)
    })
  })
})
