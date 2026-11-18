import { importProvidersFrom } from '@angular/core'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { provideMissingTranslationHandler, provideTranslateLoader, provideTranslateService } from '@ngx-translate/core'
import { ReplaySubject } from 'rxjs'

import { AngularAcceleratorModule } from '@onecx/angular-accelerator'
import { AngularAuthModule } from '@onecx/angular-auth'
import { bootstrapRemoteComponent } from '@onecx/angular-webcomponents'
import {
  MultiLanguageMissingTranslationHandler,
  OnecxTranslateLoader,
  REMOTE_COMPONENT_CONFIG,
  RemoteComponentConfig,
  provideTranslationPathFromMeta
} from '@onecx/angular-utils'
import { provideThemeConfig } from '@onecx/angular-utils/theme/primeng'

import { environment } from 'src/environments/environment'
import { OneCXChangePasswordComponent } from './change-password.component'

bootstrapRemoteComponent(OneCXChangePasswordComponent, 'ocx-change-password-component', environment.production, [
  { provide: REMOTE_COMPONENT_CONFIG, useValue: new ReplaySubject<RemoteComponentConfig>(1) },
  provideHttpClient(withInterceptorsFromDi()),
  importProvidersFrom(AngularAcceleratorModule, AngularAuthModule, BrowserAnimationsModule),
  provideTranslationPathFromMeta(import.meta.url, 'assets/i18n/'),
  provideTranslateService({
    defaultLanguage: 'en',
    loader: provideTranslateLoader(OnecxTranslateLoader),
    missingTranslationHandler: provideMissingTranslationHandler(MultiLanguageMissingTranslationHandler)
  }),
  provideThemeConfig()
]).catch((err) => console.error(err))
