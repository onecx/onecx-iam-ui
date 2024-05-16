import { ComponentHarness } from '@angular/cdk/testing'
import { PButtonDirectiveHarness } from '@onecx/angular-testing'

export class OneCXChangePasswordHarness extends ComponentHarness {
  static readonly hostSelector = 'app-ocx-change-password'

  getChangePasswordButton = this.locatorForOptional(PButtonDirectiveHarness)
  getNoPermissionDiv = this.locatorForOptional('div')

  async clickChangePasswordButton() {
    await (await this.getChangePasswordButton())?.click()
  }
}
