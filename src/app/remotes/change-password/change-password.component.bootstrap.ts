import { importProvidersFrom } from '@angular/core'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { bootstrapRemoteComponent } from '@onecx/angular-webcomponents'
import { AngularAuthModule } from '@onecx/angular-auth'

import { environment } from 'src/environments/environment'
import { OneCXChangePasswordComponent } from './change-password.component'

bootstrapRemoteComponent(OneCXChangePasswordComponent, 'ocx-change-password-component', environment.production, [
  provideHttpClient(withInterceptorsFromDi()),
  importProvidersFrom(AngularAuthModule, BrowserAnimationsModule)
])
