import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'

import { DataViewModule } from 'primeng/dataview'
import { DialogModule } from 'primeng/dialog'
import { InputTextModule } from 'primeng/inputtext'
import { ListboxModule } from 'primeng/listbox'
import { TabViewModule } from 'primeng/tabview'
import { ToastModule } from 'primeng/toast'

import { AppStateService, ConfigurationService } from '@onecx/angular-integration-interface'
import { PortalApiConfiguration, PortalCoreModule } from '@onecx/portal-integration-angular'
import { AngularRemoteComponentsModule } from '@onecx/angular-remote-components'

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
    DataViewModule,
    DialogModule,
    FormsModule,
    InputTextModule,
    ListboxModule,
    ReactiveFormsModule,
    TabViewModule,
    ToastModule,
    TranslateModule,
    AngularRemoteComponentsModule
  ],
  exports: [
    CommonModule,
    DataViewModule,
    DialogModule,
    FormsModule,
    InputTextModule,
    ListboxModule,
    ReactiveFormsModule,
    TabViewModule,
    ToastModule,
    TranslateModule,
    AngularRemoteComponentsModule
  ],
  providers: [
    LabelResolver,
    { provide: Configuration, useFactory: apiConfigProvider, deps: [ConfigurationService, AppStateService] }
  ]
})
export class SharedModule {}
