import { NgModule } from '@angular/core'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule, Routes } from '@angular/router'
import { provideMissingTranslationHandler, provideTranslateLoader, provideTranslateService } from '@ngx-translate/core'

import { StandaloneShellModule, provideStandaloneProviders } from '@onecx/angular-standalone-shell'
import { AngularAuthModule } from '@onecx/angular-auth'
import {
  MultiLanguageMissingTranslationHandler,
  OnecxTranslateLoader,
  provideTranslationPathFromMeta
} from '@onecx/angular-utils'
import { provideThemeConfig } from '@onecx/angular-utils/theme/primeng'
import { APP_CONFIG } from '@onecx/angular-integration-interface'

import { environment } from 'src/environments/environment'
import { AppComponent } from './app.component'

const routes: Routes = [{ path: '', pathMatch: 'full' }]
@NgModule({
  declarations: [],
  imports: [
    AppComponent,
    BrowserAnimationsModule,
    AngularAuthModule,
    StandaloneShellModule,
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabledBlocking',
      enableTracing: true
    })
  ],
  providers: [
    { provide: APP_CONFIG, useValue: environment },
    provideTranslateService({
      defaultLanguage: 'en',
      loader: provideTranslateLoader(OnecxTranslateLoader),
      missingTranslationHandler: provideMissingTranslationHandler(MultiLanguageMissingTranslationHandler)
    }),
    provideTranslationPathFromMeta(import.meta.url, 'assets/i18n/'),
    provideTranslationPathFromMeta(import.meta.url, 'onecx-angular-accelerator/assets/i18n/'),
    provideTranslationPathFromMeta(import.meta.url, 'onecx-angular-accelerator/assets/i18n/primeng/'),
    provideHttpClient(withInterceptorsFromDi()),
    provideThemeConfig(),
    provideStandaloneProviders()
  ]
})
export class AppModule {}
