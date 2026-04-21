import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule, Routes } from '@angular/router'
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core'

import { AngularAuthModule } from '@onecx/angular-auth'
import { createTranslateLoader, provideThemeConfig, provideTranslationPathFromMeta } from '@onecx/angular-utils'
import { APP_CONFIG } from '@onecx/angular-integration-interface'
import { AngularAcceleratorMissingTranslationHandler } from '@onecx/angular-accelerator'

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
    AngularAuthModule,
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabledBlocking',
      enableTracing: true
    }),
    TranslateModule.forRoot({
      isolate: true,
      loader: { provide: TranslateLoader, useFactory: createTranslateLoader, deps: [HttpClient] },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: AngularAcceleratorMissingTranslationHandler
      }
    })
  ],
  providers: [
    { provide: APP_CONFIG, useValue: environment },
    provideTranslationPathFromMeta(import.meta.url, 'assets/i18n/'),
    provideHttpClient(withInterceptorsFromDi()),
    provideThemeConfig()
  ]
})
export class AppModule {
  constructor() {
    console.info('OneCX IAM Module constructor')
  }
}
