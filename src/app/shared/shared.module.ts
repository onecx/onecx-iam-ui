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

import { PortalCoreModule } from '@onecx/portal-integration-angular'

import { LabelResolver } from './label.resolver'

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
    TranslateModule
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
    TranslateModule
  ],
  providers: [LabelResolver]
})
export class SharedModule {}
