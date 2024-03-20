import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { FieldsetModule } from 'primeng/fieldset'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { ConfirmationService } from 'primeng/api'

import { addInitializeModuleGuard, InitializeModuleGuard, PortalCoreModule } from '@onecx/portal-integration-angular'
import { UserSearchComponent } from './user-search/user-search.component'
import { RolesSearchComponent } from './roles-search/roles-search.component'
import { SharedModule } from '../shared/shared.module'

const routes: Routes = [
  {
    path: '',
    component: UserSearchComponent,
    pathMatch: 'full'
  },
  {
    path: 'roles',
    component: RolesSearchComponent,
    pathMatch: 'full'
  }
]

@NgModule({
  declarations: [UserSearchComponent, RolesSearchComponent],
  imports: [
    CommonModule,
    ConfirmDialogModule,
    FieldsetModule,
    FormsModule,
    PortalCoreModule.forMicroFrontend(),
    [RouterModule.forChild(addInitializeModuleGuard(routes))],
    SharedModule
  ],
  providers: [ConfirmationService, InitializeModuleGuard],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
})
export class IamModule {
  constructor() {
    console.info('IAM module constructor')
  }
}
