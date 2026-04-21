import { DoBootstrap, inject, Injector, NgModule, provideAppInitializer } from '@angular/core'
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule, Routes, Router } from '@angular/router'
import { TranslateLoader, TranslateModule, MissingTranslationHandler } from '@ngx-translate/core'

import { AngularAuthModule } from '@onecx/angular-auth'
import {
  createTranslateLoader,
  provideThemeConfig,
  provideTranslationConnectionService,
  provideTranslationPathFromMeta,
  PortalApiConfiguration
} from '@onecx/angular-utils'
import { createAppEntrypoint, initializeRouter, startsWith } from '@onecx/angular-webcomponents'
import { AppStateService, ConfigurationService } from '@onecx/angular-integration-interface'
import { SLOT_SERVICE, SlotService } from '@onecx/angular-remote-components'
import { AngularAcceleratorMissingTranslationHandler, providePortalDialogService } from '@onecx/angular-accelerator'

import { Configuration } from './shared/generated'
import { environment } from 'src/environments/environment'
import { AppEntrypointComponent } from './app-entrypoint.component'

function apiConfigProvider(configService: ConfigurationService, appStateService: AppStateService) {
  return new PortalApiConfiguration(Configuration, environment.apiPrefix)
}

const routes: Routes = [
  {
    matcher: startsWith(''),
    loadChildren: () => import('./iam/onecx-iam.module').then((m) => m.IamModule)
  }
]

@NgModule({
  declarations: [AppEntrypointComponent],
  imports: [
    AngularAuthModule,
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
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
    ConfigurationService,
    { provide: Configuration, useFactory: apiConfigProvider, deps: [ConfigurationService, AppStateService] },
    provideAppInitializer(() => {
      const router = inject(Router)
      const appStateService = inject(AppStateService)
      return initializeRouter(router, appStateService)()
    }),
    { provide: SLOT_SERVICE, useExisting: SlotService },
    provideTranslationPathFromMeta(import.meta.url, 'assets/i18n/'),
    provideTranslationConnectionService(),
    provideHttpClient(withInterceptorsFromDi()),
    providePortalDialogService(),
    provideThemeConfig()
  ]
})
export class OneCXIamModule implements DoBootstrap {
  constructor(private readonly injector: Injector) {
    console.info('OneCX IAM Module constructor')
  }

  ngDoBootstrap(): void {
    createAppEntrypoint(AppEntrypointComponent, 'ocx-iam-component', this.injector)
  }
}
