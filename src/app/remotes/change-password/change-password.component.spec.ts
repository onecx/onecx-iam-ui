import { NgModule } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { IfPermissionDirective, PortalDialogService, PortalMessageService } from '@onecx/portal-integration-angular'

import { OneCXChangePasswordComponent } from './change-password.component'
import { OneCXChangePasswordHarness } from './change-password.harness'
import { UsersInternalAPIService } from 'src/app/shared/generated'
import { ReplaySubject, of, throwError } from 'rxjs'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { BASE_URL, RemoteComponentConfig } from '@onecx/angular-remote-components'
import { TooltipModule } from 'primeng/tooltip'
import { RippleModule } from 'primeng/ripple'
import { ButtonModule } from 'primeng/button'
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog'
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component'

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

  const usersInternalApiServiceSpy = jasmine.createSpyObj<UsersInternalAPIService>('UsersInternalAPIService', [
    'resetPassword'
  ])

  const messageServiceSpy = jasmine.createSpyObj<PortalMessageService>('PortalMessageService', ['error', 'success'])

  const portalDialogServiceSpy = jasmine.createSpyObj<PortalDialogService>('PortalDialogService', ['openDialog'])

  let baseUrlSubject: ReplaySubject<any>
  beforeEach(() => {
    baseUrlSubject = new ReplaySubject<any>(1)
    TestBed.configureTestingModule({
      declarations: [],
      imports: [
        TranslateTestingModule.withTranslations({
          en: require('../../../assets/i18n/en.json')
        }).withDefaultLanguage('en')
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
      .overrideComponent(OneCXChangePasswordComponent, {
        set: {
          imports: [
            PortalDependencyModule,
            TranslateTestingModule,
            TooltipModule,
            RippleModule,
            ButtonModule,
            DynamicDialogModule
          ],
          providers: [
            DialogService,
            { provide: UsersInternalAPIService, useValue: usersInternalApiServiceSpy },
            { provide: PortalDialogService, useValue: portalDialogServiceSpy },
            { provide: PortalMessageService, useValue: messageServiceSpy }
          ]
        }
      })
      .compileComponents()

    baseUrlSubject.next('base_url_mock')

    usersInternalApiServiceSpy.resetPassword.calls.reset()
    portalDialogServiceSpy.openDialog.calls.reset()
    messageServiceSpy.error.calls.reset()
    messageServiceSpy.success.calls.reset()

    usersInternalApiServiceSpy.resetPassword.and.returnValue(of({} as any))
    portalDialogServiceSpy.openDialog.and.returnValue(of({} as any))
  })

  it('should create', () => {
    fixture = TestBed.createComponent(OneCXChangePasswordComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    expect(component).toBeTruthy()
  })

  it('should call ocxInitRemoteComponent with the correct config', () => {
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
    fixture = TestBed.createComponent(OneCXChangePasswordComponent)
    component = fixture.componentInstance
    fixture.detectChanges()

    component.ocxInitRemoteComponent({
      permissions: ['USER#EDIT'],
      baseUrl: 'base_url'
    } as RemoteComponentConfig)

    expect(component.permissions).toEqual(['USER#EDIT'])
    expect(usersInternalApiServiceSpy.configuration.basePath).toEqual('base_url/bff')
    baseUrlSubject.asObservable().subscribe((item) => {
      expect(item).toEqual('base_url')
      done()
    })
  })

  it('should not show button if permissions are not met', async () => {
    fixture = TestBed.createComponent(OneCXChangePasswordComponent)
    component = fixture.componentInstance
    fixture.detectChanges()

    oneCXChangePasswordHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, OneCXChangePasswordHarness)

    expect(await oneCXChangePasswordHarness.getChangePasswordButton()).toBeNull()
    expect(await (await oneCXChangePasswordHarness.getNoPermissionDiv())?.text()).toBe(
      'You do not have permissions to change password'
    )
  })

  it('should show button if permissions are met', async () => {
    fixture = TestBed.createComponent(OneCXChangePasswordComponent)
    component = fixture.componentInstance
    component.ocxInitRemoteComponent({
      permissions: ['USER#EDIT'],
      baseUrl: 'base_url'
    } as RemoteComponentConfig)

    fixture.detectChanges()
    oneCXChangePasswordHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, OneCXChangePasswordHarness)

    expect(await (await oneCXChangePasswordHarness.getChangePasswordButton())?.getLabel()).toBe('Change Password')
    expect(await oneCXChangePasswordHarness.getNoPermissionDiv()).toBeNull()
  })

  it('should call editPassword on enter click', () => {
    fixture = TestBed.createComponent(OneCXChangePasswordComponent)
    component = fixture.componentInstance
    fixture.detectChanges()

    spyOn(component, 'editPassword')
    component.onEnterClick()
    expect(component.editPassword).toHaveBeenCalledTimes(1)
  })

  it('should open change password dialog on button click', async () => {
    portalDialogServiceSpy.openDialog.and.returnValue(of({} as any))
    fixture = TestBed.createComponent(OneCXChangePasswordComponent)
    component = fixture.componentInstance
    component.ocxInitRemoteComponent({
      permissions: ['USER#EDIT'],
      baseUrl: 'base_url'
    } as RemoteComponentConfig)

    fixture.detectChanges()
    oneCXChangePasswordHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, OneCXChangePasswordHarness)

    await oneCXChangePasswordHarness.clickChangePasswordButton()
    expect(portalDialogServiceSpy.openDialog).toHaveBeenCalledWith(
      'CHANGE_PASSWORD.DIALOG.TITLE',
      ChangePasswordDialogComponent,
      'CHANGE_PASSWORD.DIALOG.CHANGE_BUTTON',
      'CHANGE_PASSWORD.DIALOG.CANCEL'
    )
  })

  it('should not react to secondary button click', async () => {
    portalDialogServiceSpy.openDialog.and.returnValue(
      of({
        button: 'secondary',
        result: undefined
      })
    )
    fixture = TestBed.createComponent(OneCXChangePasswordComponent)
    component = fixture.componentInstance
    component.ocxInitRemoteComponent({
      permissions: ['USER#EDIT'],
      baseUrl: 'base_url'
    } as RemoteComponentConfig)

    fixture.detectChanges()
    oneCXChangePasswordHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, OneCXChangePasswordHarness)

    await oneCXChangePasswordHarness.clickChangePasswordButton()
    expect(portalDialogServiceSpy.openDialog).toHaveBeenCalledTimes(1)
    expect(portalDialogServiceSpy.openDialog).toHaveBeenCalledWith(
      'CHANGE_PASSWORD.DIALOG.TITLE',
      ChangePasswordDialogComponent,
      'CHANGE_PASSWORD.DIALOG.CHANGE_BUTTON',
      'CHANGE_PASSWORD.DIALOG.CANCEL'
    )
    expect(usersInternalApiServiceSpy.resetPassword).toHaveBeenCalledTimes(0)
    expect(messageServiceSpy.error).toHaveBeenCalledTimes(0)
    expect(messageServiceSpy.success).toHaveBeenCalledTimes(0)
  })

  it('should open confirmation dialog on primary button click', async () => {
    portalDialogServiceSpy.openDialog.and.returnValues(
      of({
        button: 'primary',
        result: undefined
      }),
      of({} as any)
    )
    fixture = TestBed.createComponent(OneCXChangePasswordComponent)
    component = fixture.componentInstance
    component.ocxInitRemoteComponent({
      permissions: ['USER#EDIT'],
      baseUrl: 'base_url'
    } as RemoteComponentConfig)

    fixture.detectChanges()
    oneCXChangePasswordHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, OneCXChangePasswordHarness)

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
    fixture = TestBed.createComponent(OneCXChangePasswordComponent)
    component = fixture.componentInstance
    component.ocxInitRemoteComponent({
      permissions: ['USER#EDIT'],
      baseUrl: 'base_url'
    } as RemoteComponentConfig)

    fixture.detectChanges()
    oneCXChangePasswordHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, OneCXChangePasswordHarness)

    await oneCXChangePasswordHarness.clickChangePasswordButton()
    expect(portalDialogServiceSpy.openDialog).toHaveBeenCalledTimes(2)
    expect(usersInternalApiServiceSpy.resetPassword).toHaveBeenCalledTimes(0)
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
    fixture = TestBed.createComponent(OneCXChangePasswordComponent)
    component = fixture.componentInstance
    component.ocxInitRemoteComponent({
      permissions: ['USER#EDIT'],
      baseUrl: 'base_url'
    } as RemoteComponentConfig)

    fixture.detectChanges()
    oneCXChangePasswordHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, OneCXChangePasswordHarness)

    await oneCXChangePasswordHarness.clickChangePasswordButton()
    expect(portalDialogServiceSpy.openDialog).toHaveBeenCalledTimes(2)
    expect(usersInternalApiServiceSpy.resetPassword).toHaveBeenCalledOnceWith({
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
    usersInternalApiServiceSpy.resetPassword.and.returnValue(throwError(() => {}))
    fixture = TestBed.createComponent(OneCXChangePasswordComponent)
    component = fixture.componentInstance
    component.ocxInitRemoteComponent({
      permissions: ['USER#EDIT'],
      baseUrl: 'base_url'
    } as RemoteComponentConfig)

    fixture.detectChanges()
    oneCXChangePasswordHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, OneCXChangePasswordHarness)

    await oneCXChangePasswordHarness.clickChangePasswordButton()
    expect(portalDialogServiceSpy.openDialog).toHaveBeenCalledTimes(2)
    expect(usersInternalApiServiceSpy.resetPassword).toHaveBeenCalledTimes(1)
    expect(messageServiceSpy.error).toHaveBeenCalledOnceWith({
      summaryKey: 'CHANGE_PASSWORD.PASSWORD_CHANGE_ERROR'
    })
    expect(messageServiceSpy.success).toHaveBeenCalledTimes(0)
  })

  it('should display success message on successful password reset', async () => {
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
    usersInternalApiServiceSpy.resetPassword.and.returnValue(of({} as any))
    fixture = TestBed.createComponent(OneCXChangePasswordComponent)
    component = fixture.componentInstance
    component.ocxInitRemoteComponent({
      permissions: ['USER#EDIT'],
      baseUrl: 'base_url'
    } as RemoteComponentConfig)

    fixture.detectChanges()
    oneCXChangePasswordHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, OneCXChangePasswordHarness)

    await oneCXChangePasswordHarness.clickChangePasswordButton()
    expect(portalDialogServiceSpy.openDialog).toHaveBeenCalledTimes(2)
    expect(usersInternalApiServiceSpy.resetPassword).toHaveBeenCalledTimes(1)
    expect(messageServiceSpy.error).toHaveBeenCalledTimes(0)
    expect(messageServiceSpy.success).toHaveBeenCalledOnceWith({
      summaryKey: 'CHANGE_PASSWORD.PASSWORD_CHANGED_SUCCESSFULLY'
    })
  })
})
