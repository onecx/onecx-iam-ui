import { HttpClient, HttpClientModule } from '@angular/common/http'
import { APP_INITIALIZER, DoBootstrap, Injector, NgModule } from '@angular/core'
import { createCustomElement } from '@angular/elements'
import { BrowserModule } from '@angular/platform-browser'
import { Router, RouterModule, Routes } from '@angular/router'
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core'

import {
  AppStateService,
  ConfigurationService,
  createTranslateLoader,
  PortalCoreModule,
  PortalMissingTranslationHandler
} from '@onecx/portal-integration-angular'
import { addInitializeModuleGuard } from '@onecx/angular-integration-interface'
import { initializeRouter, startsWith } from '@onecx/angular-webcomponents'
import { AngularAuthModule } from '@onecx/angular-auth'
import { AppEntrypointComponent } from './app-entrypoint.component'
import { SharedModule } from './shared/shared.module'

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
    HttpClientModule,
    SharedModule,
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
    }
  ],
  schemas: []
})
export class OneCXIamModule implements DoBootstrap {
  constructor(private injector: Injector) {
    console.info('OneCX IAM Module constructor')
  }

  ngDoBootstrap(): void {
    const appEntrypoint = createCustomElement(AppEntrypointComponent, {
      injector: this.injector
    })
    customElements.define('ocx-iam-component', appEntrypoint)
  }
}
