import { ComponentHarness } from '@angular/cdk/testing'

import { PButtonDirectiveHarness } from '@onecx/angular-testing'

export class OneCXChangePasswordHarness extends ComponentHarness {
  static readonly hostSelector = 'app-ocx-change-password'

  // PrimeNG buttons embed real HTML buttons, which really are the ones that should be clicked
  getChangePasswordButton = this.locatorForOptional('#iam_change_password_confirm button')
  getChangePasswordPButton = this.locatorForOptional('#iam_change_password_confirm')

  getNoPermissionTag = this.locatorForOptional('#iam_change_password_no_permission')

  async clickChangePasswordButton() {
    await (await this.getChangePasswordButton())?.click()
  }
}
