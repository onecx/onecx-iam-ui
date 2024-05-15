import { ComponentHarness } from '@angular/cdk/testing'
import { PPasswordHarness } from '@onecx/angular-testing'

export class ChangePasswordDialogHarness extends ComponentHarness {
  static readonly hostSelector = 'app-ocx-change-password-dialog'

  getPasswordElement = this.locatorFor(PPasswordHarness.with({ id: 'password' }))
  getRepeatPasswordElement = this.locatorFor(PPasswordHarness.with({ id: 'repeat-password' }))

  getPasswordLabel = this.locatorFor('label[for=password]')
  getRepeatPasswordLabel = this.locatorFor('label[for=repeat-password]')

  async getPasswordValue(): Promise<string | null> {
    return await (await this.getPasswordElement()).getValue()
  }

  async setPasswordValue(value: string) {
    return await (await this.getPasswordElement()).setValue(value)
  }

  async getPasswordLabelText(): Promise<string> {
    return await (await this.getPasswordLabel()).text()
  }

  async getRepeatPasswordValue(): Promise<string | null> {
    return await (await this.getRepeatPasswordElement()).getValue()
  }

  async setRepeatPasswordValue(value: string) {
    return await (await this.getRepeatPasswordElement()).setValue(value)
  }

  async getRepeatPasswordLabelText(): Promise<string> {
    return await (await this.getRepeatPasswordLabel()).text()
  }
}
