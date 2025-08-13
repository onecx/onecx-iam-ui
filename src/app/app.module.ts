import { APP_INITIALIZER, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule, Routes } from '@angular/router'
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core'

import { KeycloakAuthModule } from '@onecx/keycloak-auth'
import { createTranslateLoader, provideTranslationPathFromMeta } from '@onecx/angular-utils'
import { APP_CONFIG, UserService } from '@onecx/angular-integration-interface'
import {
  translateServiceInitializer,
  PortalMissingTranslationHandler,
  PortalCoreModule
} from '@onecx/portal-integration-angular'

import { environment } from 'src/environments/environment'
import { AppComponent } from './app.component'

const routes: Routes = [{ path: '', pathMatch: 'full' }]
@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    KeycloakAuthModule,
    PortalCoreModule.forRoot('onecx-iam-ui'),
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabledBlocking',
      enableTracing: true
    }),
    TranslateModule.forRoot({
      isolate: true,
      loader: { provide: TranslateLoader, useFactory: createTranslateLoader, deps: [HttpClient] },
      missingTranslationHandler: { provide: MissingTranslationHandler, useClass: PortalMissingTranslationHandler }
    })
  ],
  providers: [
    { provide: APP_CONFIG, useValue: environment },
    {
      provide: APP_INITIALIZER,
      useFactory: translateServiceInitializer,
      multi: true,
      deps: [UserService, TranslateService]
    },
    provideTranslationPathFromMeta(import.meta.url, 'assets/i18n/'),
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class AppModule {
  constructor() {
    console.info('OneCX IAM Module constructor')
  }
}
