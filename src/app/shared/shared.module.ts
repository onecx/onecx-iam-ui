import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core'
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
  //this is not elegant, for some reason the injection token from primeng does not work across federated module
  providers: [LabelResolver],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule {}
