import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { AppStateService, ConfigurationService } from '@onecx/angular-integration-interface'
import { PortalApiConfiguration, providePermissionService, provideThemeConfig } from '@onecx/angular-utils'

import { Configuration } from 'src/app/shared/generated'
import { environment } from 'src/environments/environment'
import { LabelResolver } from 'src/app/shared/label.resolver'

import { UserSearchComponent } from './user-search/user-search.component'
import { RoleSearchComponent } from './role-search/role-search.component'
import { UserDetailComponent } from './user-detail/user-detail.component'
import { UserPermissionsComponent } from './user-permissions/user-permissions.component'

export function apiConfigProvider(configService: ConfigurationService, appStateService: AppStateService) {
  return new PortalApiConfiguration(Configuration, environment.apiPrefix)
}

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
  declarations: [],
  imports: [
    RouterModule.forChild(routes),
    UserSearchComponent,
    RoleSearchComponent,
    UserDetailComponent,
    UserPermissionsComponent
  ],
  providers: [
    LabelResolver,
    { provide: Configuration, useFactory: apiConfigProvider, deps: [ConfigurationService, AppStateService] },
    ...providePermissionService(),
    provideThemeConfig()
  ]
})
export class IamModule {
  constructor() {
    console.info('IAM module constructor')
  }
}
