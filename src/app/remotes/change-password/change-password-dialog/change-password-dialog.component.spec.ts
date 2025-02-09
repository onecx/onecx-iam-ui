import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'

import { ChangePasswordDialogComponent } from './change-password-dialog.component'
import { ChangePasswordDialogHarness } from './/change-password-dialog.harness'

describe('ChangePasswordDialog', () => {
  let component: ChangePasswordDialogComponent
  let fixture: ComponentFixture<ChangePasswordDialogComponent>
  let changePasswordDialogHarness: ChangePasswordDialogHarness

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [],
      imports: [
        ChangePasswordDialogComponent,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        TranslateTestingModule.withTranslations({
          en: require('../../../../assets/i18n/en.json'),
          de: require('../../../../assets/i18n/de.json')
        }).withDefaultLanguage('en')
      ],
      providers: [DynamicDialogConfig, DynamicDialogRef]
    }).compileComponents()

    fixture = TestBed.createComponent(ChangePasswordDialogComponent)
    component = fixture.componentInstance

    fixture.detectChanges()

    changePasswordDialogHarness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      ChangePasswordDialogHarness
    )
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should display correct labels', async () => {
    expect(await changePasswordDialogHarness.getPasswordLabelText()).toEqual('New password')
    expect(await changePasswordDialogHarness.getRepeatPasswordLabelText()).toEqual('Confirm new password')

    expect(await (await changePasswordDialogHarness.getPasswordElement()).getPromptLabel()).toBe('Choose a password')
    expect(await (await changePasswordDialogHarness.getPasswordElement()).getWeakLabel()).toBe('Weak password')
    expect(await (await changePasswordDialogHarness.getPasswordElement()).getMediumLabel()).toBe(
      'Average complexity password'
    )
    expect(await (await changePasswordDialogHarness.getPasswordElement()).getStrongLabel()).toBe('Strong password')
  })

  it('should initially have empty values', async () => {
    expect(await changePasswordDialogHarness.getPasswordValue()).toBe('')
    expect(await changePasswordDialogHarness.getRepeatPasswordValue()).toBe('')
  })

  it('should indicate error, disable primary button and have empty result when passwords do not match', async () => {
    const buttonEnabledSpy = spyOn(component.primaryButtonEnabled, 'emit')

    await changePasswordDialogHarness.setPasswordValue('pass')

    expect(component.primaryButtonEnabled.emit).toHaveBeenCalledWith(false)
    expect(component.dialogResult).toBe('')
    expect(component.formGroup.valid).toBeFalse()
    buttonEnabledSpy.calls.reset()

    await changePasswordDialogHarness.setRepeatPasswordValue('other')
    expect(component.primaryButtonEnabled.emit).toHaveBeenCalledWith(false)
    expect(component.dialogResult).toBe('')
    expect(component.formGroup.valid).toBeFalse()
  })

  it('should not indicate error, enable primary button and store correct result when passwords match', async () => {
    const buttonEnabledSpy = spyOn(component.primaryButtonEnabled, 'emit')

    await changePasswordDialogHarness.setPasswordValue('pass')

    expect(component.primaryButtonEnabled.emit).toHaveBeenCalledWith(false)
    expect(component.dialogResult).toBe('')
    expect(component.formGroup.valid).toBeFalse()
    buttonEnabledSpy.calls.reset()

    await changePasswordDialogHarness.setRepeatPasswordValue('pass')
    expect(component.primaryButtonEnabled.emit).toHaveBeenCalledWith(true)
    expect(component.dialogResult).toBe('pass')
    expect(component.formGroup.valid).toBeTrue()
  })
})
