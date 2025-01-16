import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { ConfirmationService } from 'primeng/api'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { FieldsetModule } from 'primeng/fieldset'

import { addInitializeModuleGuard, InitializeModuleGuard } from '@onecx/angular-integration-interface'
import { PortalCoreModule } from '@onecx/portal-integration-angular'

import { SharedModule } from 'src/app/shared/shared.module'
import { LabelResolver } from 'src/app/shared/label.resolver'

import { UserSearchComponent } from './user-search/user-search.component'
import { RoleSearchComponent } from './role-search/role-search.component'

const routes: Routes = [
  {
    path: '',
    component: UserSearchComponent,
    pathMatch: 'full',
    data: {
      breadcrumb: 'BREADCRUMBS.USERS',
      breadcrumbFn: (data: any) => `${data.labeli18n}`
    },
    resolve: {
      labeli18n: LabelResolver
    }
  },
  {
    path: 'roles',
    component: RoleSearchComponent,
    pathMatch: 'full',
    data: {
      breadcrumb: 'BREADCRUMBS.ROLES',
      breadcrumbFn: (data: any) => `${data.labeli18n}`
    },
    resolve: {
      labeli18n: LabelResolver
    }
  }
]

@NgModule({
  declarations: [UserSearchComponent, RoleSearchComponent],
  imports: [
    CommonModule,
    ConfirmDialogModule,
    FieldsetModule,
    FormsModule,
    PortalCoreModule.forMicroFrontend(),
    [RouterModule.forChild(addInitializeModuleGuard(routes))],
    SharedModule
  ],
  providers: [ConfirmationService, InitializeModuleGuard]
})
export class IamModule {
  constructor() {
    console.info('IAM module constructor')
  }
}
