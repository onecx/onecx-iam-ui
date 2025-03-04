import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { addInitializeModuleGuard, InitializeModuleGuard } from '@onecx/angular-integration-interface'
import { PortalCoreModule } from '@onecx/portal-integration-angular'

import { SharedModule } from 'src/app/shared/shared.module'
import { LabelResolver } from 'src/app/shared/label.resolver'

import { UserSearchComponent } from './user-search/user-search.component'
import { RoleSearchComponent } from './role-search/role-search.component'
import { UserDetailComponent } from './user-detail/user-detail.component'
import { UserPermissionsComponent } from './user-permissions/user-permissions.component'

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
    path: 'users',
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
  declarations: [RoleSearchComponent, UserSearchComponent, UserDetailComponent, UserPermissionsComponent],
  imports: [
    PortalCoreModule.forMicroFrontend(),
    [RouterModule.forChild(addInitializeModuleGuard(routes))],
    SharedModule
  ],
  providers: [InitializeModuleGuard]
})
export class IamModule {
  constructor() {
    console.info('IAM module constructor')
  }
}
