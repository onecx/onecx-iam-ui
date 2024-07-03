import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { importProvidersFrom } from '@angular/core'
import { OneCXChangePasswordComponent } from './change-password.component'
import { bootstrapRemoteComponent } from '@onecx/angular-webcomponents'
import { AngularAuthModule } from '@onecx/angular-auth'
import { environment } from 'src/environments/environment'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

bootstrapRemoteComponent(OneCXChangePasswordComponent, 'ocx-change-password-component', environment.production, [
  provideHttpClient(withInterceptorsFromDi()),
  importProvidersFrom(AngularAuthModule, BrowserAnimationsModule)
])
