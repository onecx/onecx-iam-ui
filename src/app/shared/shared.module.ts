import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'

import { DataViewModule } from 'primeng/dataview'
import { DialogModule } from 'primeng/dialog'
import { DropdownModule } from 'primeng/dropdown'
import { InputTextModule } from 'primeng/inputtext'
import { ListboxModule } from 'primeng/listbox'
import { SelectButtonModule } from 'primeng/selectbutton'
import { TableModule } from 'primeng/table'
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
    DropdownModule,
    FormsModule,
    InputTextModule,
    ListboxModule,
    ReactiveFormsModule,
    SelectButtonModule,
    TableModule,
    ToastModule,
    TranslateModule
  ],
  exports: [
    CommonModule,
    DataViewModule,
    DialogModule,
    DropdownModule,
    FormsModule,
    InputTextModule,
    ListboxModule,
    ReactiveFormsModule,
    SelectButtonModule,
    TableModule,
    ToastModule,
    TranslateModule
  ],
  providers: [LabelResolver]
})
export class SharedModule {}
