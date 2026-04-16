import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'

import { DialogModule } from 'primeng/dialog'
import { ButtonModule } from 'primeng/button'
import { DropdownModule } from 'primeng/dropdown'
import { InputTextModule } from 'primeng/inputtext'
import { MessageModule } from 'primeng/message'
import { TextareaModule } from 'primeng/textarea'
import { ListboxModule } from 'primeng/listbox'
import { TabViewModule } from 'primeng/tabview'
import { FloatLabelModule } from 'primeng/floatlabel'
import { ToastModule } from 'primeng/toast'
import { TooltipModule } from 'primeng/tooltip'

import { AppStateService, ConfigurationService } from '@onecx/angular-integration-interface'
import {
  PortalApiConfiguration,
  PortalPageComponent,
  providePermissionService,
  provideThemeConfig
} from '@onecx/angular-utils'
import { AngularRemoteComponentsModule } from '@onecx/angular-remote-components'
import { AngularAcceleratorModule } from '@onecx/angular-accelerator'

import { Configuration } from 'src/app/shared/generated'
import { environment } from 'src/environments/environment'
import { LabelResolver } from './label.resolver'

export function apiConfigProvider(configService: ConfigurationService, appStateService: AppStateService) {
  return new PortalApiConfiguration(Configuration, environment.apiPrefix)
}

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    DropdownModule,
    FormsModule,
    FloatLabelModule,
    InputTextModule,
    MessageModule,
    TextareaModule,
    ListboxModule,
    ReactiveFormsModule,
    TabViewModule,
    ToastModule,
    TooltipModule,
    TranslateModule,
    PortalPageComponent,
    AngularRemoteComponentsModule,
    AngularAcceleratorModule
  ],
  exports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    DropdownModule,
    FormsModule,
    FloatLabelModule,
    InputTextModule,
    MessageModule,
    TextareaModule,
    ListboxModule,
    ReactiveFormsModule,
    TabViewModule,
    ToastModule,
    TooltipModule,
    TranslateModule,
    PortalPageComponent,
    AngularRemoteComponentsModule,
    AngularAcceleratorModule
  ],
  providers: [
    LabelResolver,
    { provide: Configuration, useFactory: apiConfigProvider, deps: [ConfigurationService, AppStateService] },
    ...providePermissionService(),
    provideThemeConfig()
  ]
})
export class SharedModule {}
