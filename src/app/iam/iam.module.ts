import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { providePermissionService } from '@onecx/angular-utils'

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
  imports: [RouterModule.forChild(routes), UserSearchComponent, RoleSearchComponent],
  providers: [...providePermissionService()]
})
export class IamModule {}
