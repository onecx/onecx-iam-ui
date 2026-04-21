import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'

import { DialogModule } from 'primeng/dialog'
import { InputTextModule } from 'primeng/inputtext'
import { InputTextareaModule } from 'primeng/inputtextarea'
import { ListboxModule } from 'primeng/listbox'
import { TabViewModule } from 'primeng/tabview'
import { ToastModule } from 'primeng/toast'

import { AppStateService, ConfigurationService } from '@onecx/angular-integration-interface'
import { PortalCoreModule } from '@onecx/portal-integration-angular'
import { PortalApiConfiguration } from '@onecx/angular-utils'
import { AngularRemoteComponentsModule } from '@onecx/angular-remote-components'
import { AngularAcceleratorModule } from '@onecx/angular-accelerator'

import { Configuration } from 'src/app/shared/generated'
import { environment } from 'src/environments/environment'
import { LabelResolver } from './label.resolver'

export function apiConfigProvider(configService: ConfigurationService, appStateService: AppStateService) {
  return new PortalApiConfiguration(Configuration, environment.apiPrefix, configService, appStateService)
}

@NgModule({
  declarations: [],
  imports: [
    PortalCoreModule.forMicroFrontend(),
    CommonModule,
    DialogModule,
    FormsModule,
    InputTextModule,
    InputTextareaModule,
    ListboxModule,
    ReactiveFormsModule,
    TabViewModule,
    ToastModule,
    TranslateModule,
    AngularRemoteComponentsModule,
    AngularAcceleratorModule
  ],
  exports: [
    CommonModule,
    DialogModule,
    FormsModule,
    InputTextModule,
    InputTextareaModule,
    ListboxModule,
    ReactiveFormsModule,
    TabViewModule,
    ToastModule,
    TranslateModule,
    AngularRemoteComponentsModule,
    AngularAcceleratorModule
  ],
  providers: [
    LabelResolver,
    { provide: Configuration, useFactory: apiConfigProvider, deps: [ConfigurationService, AppStateService] }
  ]
})
export class SharedModule {}
