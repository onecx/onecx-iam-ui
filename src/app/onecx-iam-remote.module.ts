import { APP_INITIALIZER, DoBootstrap, Injector, NgModule } from '@angular/core'
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { BrowserModule } from '@angular/platform-browser'
import { Router, RouterModule, Routes } from '@angular/router'
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core'

import {
  createTranslateLoader,
  PortalApiConfiguration,
  PortalCoreModule,
  PortalMissingTranslationHandler
} from '@onecx/portal-integration-angular'
import { addInitializeModuleGuard, AppStateService, ConfigurationService } from '@onecx/angular-integration-interface'
import { createAppEntrypoint, initializeRouter, startsWith } from '@onecx/angular-webcomponents'
import { AngularAuthModule } from '@onecx/angular-auth'

import { AppEntrypointComponent } from './app-entrypoint.component'
import { environment } from 'src/environments/environment'
import { Configuration } from './shared/generated'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

function apiConfigProvider(configService: ConfigurationService, appStateService: AppStateService) {
  return new PortalApiConfiguration(Configuration, environment.apiPrefix, configService, appStateService)
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
    RouterModule.forRoot(addInitializeModuleGuard(routes)),
    PortalCoreModule.forMicroFrontend(),
    TranslateModule.forRoot({
      isolate: true,
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient, AppStateService]
      },
      missingTranslationHandler: { provide: MissingTranslationHandler, useClass: PortalMissingTranslationHandler }
    })
  ],
  exports: [],
  providers: [
    ConfigurationService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeRouter,
      multi: true,
      deps: [Router, AppStateService]
    },
    { provide: Configuration, useFactory: apiConfigProvider, deps: [ConfigurationService, AppStateService] },
    provideHttpClient(withInterceptorsFromDi())
  ],
  schemas: []
})
export class OneCXIamModule implements DoBootstrap {
  constructor(private readonly injector: Injector) {
    console.info('OneCX IAM Module constructor')
  }

  ngDoBootstrap(): void {
    createAppEntrypoint(AppEntrypointComponent, 'ocx-iam-component', this.injector)
  }
}
