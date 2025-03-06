import { TestBed } from '@angular/core/testing'
import { CommonModule } from '@angular/common'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter, RouterModule } from '@angular/router'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { of, ReplaySubject, throwError } from 'rxjs'
import { PanelMenuModule } from 'primeng/panelmenu'

import { BASE_URL, RemoteComponentConfig } from '@onecx/angular-remote-components'

import { RolesInternalAPIService, UserRolesResponse } from 'src/app/shared/generated'
import { OneCXIamUserRolesComponent } from './iam-user-roles.component'

describe('OneCXIamUserRolesComponent', () => {
  const roleApiSpy = {
    getUserRoles: jasmine.createSpy('getUserRoles').and.returnValue(of({}))
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
          en: require('../../../assets/i18n/en.json')
        }).withDefaultLanguage('en'),
        NoopAnimationsModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: BASE_URL,
          useValue: baseUrlSubject
        },
        provideRouter([{ path: 'admin/theme', component: OneCXIamUserRolesComponent }])
      ]
    })
      .overrideComponent(OneCXIamUserRolesComponent, {
        set: {
          imports: [TranslateTestingModule, CommonModule, RouterModule, PanelMenuModule],
          providers: [{ provide: RolesInternalAPIService, useValue: roleApiSpy }]
        }
      })
      .compileComponents()

    baseUrlSubject.next('base_url_mock')
    roleApiSpy.getUserRoles.calls.reset()
  })

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

    component.ocxInitRemoteComponent({
      baseUrl: 'base_url'
    } as RemoteComponentConfig)

    baseUrlSubject.asObservable().subscribe((item) => {
      expect(item).toEqual('base_url')
      done()
    })
  })

  it('should call getUserRoles with the current user', () => {
    const { component } = setUp()
    component.userId = 'user'

    component.ngOnChanges()
  })

  describe('getting roles', () => {
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
})
