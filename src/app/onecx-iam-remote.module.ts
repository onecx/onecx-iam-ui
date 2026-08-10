import { DoBootstrap, inject, Injector, NgModule, provideAppInitializer } from '@angular/core'
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule, Routes, Router } from '@angular/router'
import { TranslateLoader, TranslateModule, MissingTranslationHandler } from '@ngx-translate/core'

import { AngularAuthModule } from '@onecx/angular-auth'
import {
  createTranslateLoader,
  provideThemeConfig,
  provideTranslationConnectionService,
  provideTranslationPathFromMeta,
  PortalApiConfiguration,
  MultiLanguageMissingTranslationHandler
} from '@onecx/angular-utils'
import { createAppEntrypoint, initializeRouter, startsWith } from '@onecx/angular-webcomponents'
import { AppStateService, ConfigurationService } from '@onecx/angular-integration-interface'
import { SLOT_SERVICE, SlotService } from '@onecx/angular-remote-components'
import { AngularAcceleratorModule, providePortalDialogService } from '@onecx/angular-accelerator'

import { environment } from 'src/environments/environment'
import { Configuration } from './shared/generated'
import { LabelResolver } from './shared/label.resolver'
import { AppEntrypointComponent } from './app-entrypoint.component'

function apiConfigProvider(configService: ConfigurationService, appStateService: AppStateService) {
  return new PortalApiConfiguration(Configuration, environment.apiPrefix)
}

const routes: Routes = [
  {
    matcher: startsWith(''),
    loadChildren: () => import('./iam/iam.module').then((m) => m.IamModule)
  }
]

@NgModule({
  imports: [
    AppEntrypointComponent,
    AngularAcceleratorModule,
    AngularAuthModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    TranslateModule.forRoot({
      isolate: true,
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MultiLanguageMissingTranslationHandler
      }
    })
  ],
  providers: [
    ConfigurationService,
    LabelResolver,
    { provide: Configuration, useFactory: apiConfigProvider, deps: [ConfigurationService, AppStateService] },
    provideAppInitializer(() => {
      const router = inject(Router)
      const appStateService = inject(AppStateService)
      return initializeRouter(router, appStateService)()
    }),
    { provide: SLOT_SERVICE, useExisting: SlotService },
    provideTranslationPathFromMeta(import.meta.url, 'assets/i18n/'),
    provideTranslationPathFromMeta(import.meta.url, 'onecx-angular-accelerator/assets/i18n/'),
    provideTranslationPathFromMeta(import.meta.url, 'onecx-angular-accelerator/assets/i18n/primeng/'),
    provideTranslationConnectionService(),
    provideHttpClient(withInterceptorsFromDi()),
    providePortalDialogService(),
    provideThemeConfig()
  ]
})
export class OneCXIamModule implements DoBootstrap {
  private readonly injector = inject(Injector)

  ngDoBootstrap(): void {
    createAppEntrypoint(AppEntrypointComponent, 'ocx-iam-component', this.injector)
  }
}
