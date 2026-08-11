/* eslint-disable deprecation/deprecation */
import { NgModule } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { ReplaySubject, of, throwError } from 'rxjs'
import { TranslateTestingModule } from 'ngx-translate-testing'

import { ButtonModule } from 'primeng/button'
import { MessageModule } from 'primeng/message'
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog'
import { RippleModule } from 'primeng/ripple'
import { TooltipModule } from 'primeng/tooltip'

import { PortalMessageService } from '@onecx/angular-integration-interface'
import { IfPermissionDirective } from '@onecx/angular-accelerator'
import { HAS_PERMISSION_CHECKER, REMOTE_COMPONENT_CONFIG, RemoteComponentConfig } from '@onecx/angular-utils'

import { PortalDialogService } from '@onecx/angular-accelerator'
import { provideUserServiceMock, UserServiceMock } from '@onecx/angular-integration-interface/mocks'

import { UserInternalAPIService } from 'src/app/shared/generated'
import { OneCXChangePasswordComponent } from './change-password.component'
import { OneCXChangePasswordHarness } from './change-password.harness'
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component'
import { provideNoopAnimations } from '@angular/platform-browser/animations'

const pwdChangePermission = 'USER#EDIT'
const mockConfigWithPermission: RemoteComponentConfig = {
  appId: 'appId',
  productName: 'prodName',
  permissions: [pwdChangePermission],
  baseUrl: 'base_url'
}

@NgModule({
  imports: [],
  declarations: [IfPermissionDirective],
  exports: [IfPermissionDirective]
})
class PortalDependencyModule {}

describe('ChangePasswordComponent', () => {
  let component: OneCXChangePasswordComponent
  let fixture: ComponentFixture<OneCXChangePasswordComponent>
  let oneCXChangePasswordHarness: OneCXChangePasswordHarness
  let remoteComponentConfigSubject: ReplaySubject<RemoteComponentConfig>

  const userApiSpy = jasmine.createSpyObj<UserInternalAPIService>('UserInternalAPIService', ['resetPassword'])
  const messageServiceSpy = jasmine.createSpyObj<PortalMessageService>('PortalMessageService', ['error', 'success'])
  const portalDialogServiceSpy = jasmine.createSpyObj<PortalDialogService>('PortalDialogService', ['openDialog'])

  const initComponent = function (cfg: RemoteComponentConfig) {
    fixture = TestBed.createComponent(OneCXChangePasswordComponent)
    component = fixture.componentInstance
    component.ocxRemoteComponentConfig = cfg
    fixture.detectChanges()
  }

  beforeEach(() => {
    remoteComponentConfigSubject = new ReplaySubject<RemoteComponentConfig>(1)
    TestBed.configureTestingModule({
      declarations: [],
      imports: [
        OneCXChangePasswordComponent,
        TranslateTestingModule.withTranslations({
          de: require('src/assets/i18n/de.json'),
          en: require('src/assets/i18n/en.json')
        }).withDefaultLanguage('en')
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideUserServiceMock(),
        provideNoopAnimations(),
        { provide: REMOTE_COMPONENT_CONFIG, useValue: remoteComponentConfigSubject },
        { provide: HAS_PERMISSION_CHECKER, useClass: UserServiceMock },
        { provide: UserInternalAPIService, useValue: userApiSpy },
        { provide: PortalDialogService, useValue: portalDialogServiceSpy },
        { provide: PortalMessageService, useValue: messageServiceSpy }
      ]
    })
      .overrideComponent(OneCXChangePasswordComponent, {
        set: {
          imports: [
            PortalDependencyModule,
            TranslateTestingModule,
            TooltipModule,
            RippleModule,
            ButtonModule,
            MessageModule,
            DynamicDialogModule
          ],
          providers: [
            DialogService,
            { provide: UserInternalAPIService, useValue: userApiSpy },
            { provide: PortalDialogService, useValue: portalDialogServiceSpy },
            { provide: PortalMessageService, useValue: messageServiceSpy }
          ]
        }
      })
      .compileComponents()
    remoteComponentConfigSubject.next(mockConfigWithPermission)
  })

  afterEach(() => {
    userApiSpy.resetPassword.calls.reset()
    portalDialogServiceSpy.openDialog.calls.reset()
    messageServiceSpy.error.calls.reset()
    messageServiceSpy.success.calls.reset()
    userApiSpy.resetPassword.and.returnValue(of({} as any))
    portalDialogServiceSpy.openDialog.and.returnValue(of({} as any))
  })

  describe('initialize', () => {
    beforeEach(async () => {
      initComponent(mockConfigWithPermission)
    })

    it('should create', () => {
      expect(component).toBeTruthy()
      expect(component.permissions).toEqual(mockConfigWithPermission.permissions)
    })

    it('should init remote component', (done: DoneFn) => {
      expect(component.permissions).toEqual([pwdChangePermission])
      expect(userApiSpy.configuration.basePath).toEqual('base_url/bff')
      remoteComponentConfigSubject.asObservable().subscribe((item) => {
        expect(item.baseUrl).toEqual('base_url')
        done()
      })
    })
  })

  describe('permission', () => {
    it('should not show button if permissions are not met', async () => {
      initComponent({ ...mockConfigWithPermission, permissions: ['not-met-perm'] })

      oneCXChangePasswordHarness = await TestbedHarnessEnvironment.harnessForFixture(
        fixture,
        OneCXChangePasswordHarness
      )

      expect(await oneCXChangePasswordHarness.getChangePasswordButton()).toBeNull()
      expect(await oneCXChangePasswordHarness.getNoPermissionTag()).not.toBeNull()
    })

    it('should show button if permissions are met', async () => {
      initComponent(mockConfigWithPermission)

      oneCXChangePasswordHarness = await TestbedHarnessEnvironment.harnessForFixture(
        fixture,
        OneCXChangePasswordHarness
      )

      expect(await oneCXChangePasswordHarness.getChangePasswordButton()).not.toBeNull()
      expect(await oneCXChangePasswordHarness.getNoPermissionTag()).toBeNull()
    })
  })

  describe('open dialog', () => {
    beforeEach(async () => {
      initComponent(mockConfigWithPermission)

      oneCXChangePasswordHarness = await TestbedHarnessEnvironment.harnessForFixture(
        fixture,
        OneCXChangePasswordHarness
      )
    })

    it('should call editPassword on enter click', () => {
      spyOn(component, 'editPassword')

      component.onEnterClick()

      expect(component.editPassword).toHaveBeenCalledTimes(1)
    })

    it('should open change password dialog on button click', async () => {
      portalDialogServiceSpy.openDialog.and.returnValue(of({} as any))

      await oneCXChangePasswordHarness.clickChangePasswordButton()
      expect(portalDialogServiceSpy.openDialog).toHaveBeenCalledWith(
        'CHANGE_PASSWORD.DIALOG.TITLE',
        ChangePasswordDialogComponent,
        'CHANGE_PASSWORD.DIALOG.CHANGE_BUTTON',
        'CHANGE_PASSWORD.DIALOG.CANCEL'
      )
    })

    it('should not react to secondary button click', async () => {
      portalDialogServiceSpy.openDialog.and.returnValue(of({ button: 'secondary', result: undefined }))

      await oneCXChangePasswordHarness.clickChangePasswordButton()

      expect(portalDialogServiceSpy.openDialog).toHaveBeenCalledTimes(1)
      expect(portalDialogServiceSpy.openDialog).toHaveBeenCalledWith(
        'CHANGE_PASSWORD.DIALOG.TITLE',
        ChangePasswordDialogComponent,
        'CHANGE_PASSWORD.DIALOG.CHANGE_BUTTON',
        'CHANGE_PASSWORD.DIALOG.CANCEL'
      )
      expect(userApiSpy.resetPassword).toHaveBeenCalledTimes(0)
      expect(messageServiceSpy.error).toHaveBeenCalledTimes(0)
      expect(messageServiceSpy.success).toHaveBeenCalledTimes(0)
    })

    it('should open confirmation dialog on primary button click', async () => {
      portalDialogServiceSpy.openDialog.and.returnValues(of({ button: 'primary', result: undefined }), of({} as any))

      await oneCXChangePasswordHarness.clickChangePasswordButton()

      expect(portalDialogServiceSpy.openDialog).toHaveBeenCalledTimes(2)
      expect(portalDialogServiceSpy.openDialog).toHaveBeenCalledWith(
        'CHANGE_PASSWORD.DIALOG.TITLE',
        ChangePasswordDialogComponent,
        'CHANGE_PASSWORD.DIALOG.CHANGE_BUTTON',
        'CHANGE_PASSWORD.DIALOG.CANCEL'
      )
      expect(portalDialogServiceSpy.openDialog).toHaveBeenCalledWith(
        'CHANGE_PASSWORD.CONFIRM_DIALOG.TITLE',
        'CHANGE_PASSWORD.CONFIRM_DIALOG.MESSAGE',
        'CHANGE_PASSWORD.CONFIRM_DIALOG.YES',
        'CHANGE_PASSWORD.CONFIRM_DIALOG.NO'
      )
    })

    it('should not react when change password not confirmed', async () => {
      portalDialogServiceSpy.openDialog.and.returnValues(
        of({
          button: 'primary',
          result: undefined
        }),
        of({
          button: 'secondary',
          result: undefined
        })
      )
      await oneCXChangePasswordHarness.clickChangePasswordButton()

      expect(portalDialogServiceSpy.openDialog).toHaveBeenCalledTimes(2)
      expect(userApiSpy.resetPassword).toHaveBeenCalledTimes(0)
      expect(messageServiceSpy.error).toHaveBeenCalledTimes(0)
      expect(messageServiceSpy.success).toHaveBeenCalledTimes(0)
    })

    it('should call reset password when change password confirmed', async () => {
      portalDialogServiceSpy.openDialog.and.returnValues(
        of({
          button: 'primary',
          result: 'new_password'
        }),
        of({
          button: 'primary',
          result: undefined
        })
      )
      await oneCXChangePasswordHarness.clickChangePasswordButton()

      expect(portalDialogServiceSpy.openDialog).toHaveBeenCalledTimes(2)
      expect(userApiSpy.resetPassword).toHaveBeenCalledOnceWith({
        userResetPasswordRequest: { password: 'new_password' }
      })
    })

    it('should display error message on failed resetPassword call', async () => {
      portalDialogServiceSpy.openDialog.and.returnValues(
        of({
          button: 'primary',
          result: 'new_password'
        }),
        of({
          button: 'primary',
          result: undefined
        })
      )
      userApiSpy.resetPassword.and.returnValue(throwError(() => {}))

      await oneCXChangePasswordHarness.clickChangePasswordButton()
      expect(portalDialogServiceSpy.openDialog).toHaveBeenCalledTimes(2)
      expect(userApiSpy.resetPassword).toHaveBeenCalledTimes(1)
      expect(messageServiceSpy.error).toHaveBeenCalledOnceWith({
        summaryKey: 'CHANGE_PASSWORD.PASSWORD_CHANGE_ERROR'
      })
      expect(messageServiceSpy.success).toHaveBeenCalledTimes(0)
    })

    it('should display success message on successful password reset', async () => {
      userApiSpy.resetPassword.and.returnValue(of({} as any))
      portalDialogServiceSpy.openDialog.and.returnValues(
        of({
          button: 'primary',
          result: 'new_password'
        }),
        of({
          button: 'primary',
          result: undefined
        })
      )
      await oneCXChangePasswordHarness.clickChangePasswordButton()

      expect(portalDialogServiceSpy.openDialog).toHaveBeenCalledTimes(2)
      expect(userApiSpy.resetPassword).toHaveBeenCalledTimes(1)
      expect(messageServiceSpy.error).toHaveBeenCalledTimes(0)
      expect(messageServiceSpy.success).toHaveBeenCalledOnceWith({
        summaryKey: 'CHANGE_PASSWORD.PASSWORD_CHANGED_SUCCESSFULLY'
      })
    })
  })
})
