import { Component, EventEmitter, Inject, Input, OnChanges } from '@angular/core'
import { CommonModule, Location } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { UntilDestroy } from '@ngneat/until-destroy'
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core'
import { catchError, finalize, map, Observable, of, ReplaySubject } from 'rxjs'

import {
  AngularRemoteComponentsModule,
  BASE_URL,
  RemoteComponentConfig,
  ocxRemoteComponent,
  ocxRemoteWebcomponent,
  provideTranslateServiceForRoot
} from '@onecx/angular-remote-components'
import { PortalCoreModule, UserService, createRemoteComponentTranslateLoader } from '@onecx/portal-integration-angular'

import {
  Configuration,
  Role,
  RolesInternalAPIService,
  RolePageResult,
  RoleSearchCriteria,
  UserRolesResponse
} from 'src/app/shared/generated'
import { SharedModule } from 'src/app/shared/shared.module'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-iam-user-roles',
  templateUrl: './iam-user-roles.component.html',
  standalone: true,
  imports: [AngularRemoteComponentsModule, CommonModule, PortalCoreModule, TranslateModule, SharedModule],
  providers: [
    {
      provide: BASE_URL,
      useValue: new ReplaySubject<string>(1)
    },
    provideTranslateServiceForRoot({
      isolate: true,
      loader: {
        provide: TranslateLoader,
        useFactory: createRemoteComponentTranslateLoader,
        deps: [HttpClient, BASE_URL]
      }
    })
  ]
})
@UntilDestroy()
export class OneCXIamUserRolesComponent implements ocxRemoteComponent, ocxRemoteWebcomponent, OnChanges {
  @Input() userId: string | undefined = undefined
  @Input() refresh: boolean | undefined = false // on any change here a reload is triggered
  @Input() roleList = new EventEmitter<Role[]>() // provided in slot (output)

  public iamRoles$: Observable<Role[]> | undefined

  constructor(
    @Inject(BASE_URL) private readonly baseUrl: ReplaySubject<string>,
    private readonly userService: UserService,
    private readonly translateService: TranslateService,
    private readonly roleApi: RolesInternalAPIService
  ) {
    this.userService.lang$.subscribe((lang) => this.translateService.use(lang))
  }

  @Input() set ocxRemoteComponentConfig(config: RemoteComponentConfig) {
    this.ocxInitRemoteComponent(config)
  }

  ocxInitRemoteComponent(remoteComponentConfig: RemoteComponentConfig) {
    this.baseUrl.next(remoteComponentConfig.baseUrl)
    this.roleApi.configuration = new Configuration({
      basePath: Location.joinWithSlash(remoteComponentConfig.baseUrl, environment.apiPrefix)
    })
  }

  public ngOnChanges(): void {
    let roles: Role[] = []
    if (this.userId === '$$ocx-iam-roles-search-all-indicator$$') {
      this.roleApi
        .searchRolesByCriteria({ roleSearchCriteria: { pageSize: 1000 } as RoleSearchCriteria })
        .pipe(
          map((response: RolePageResult) => {
            roles = response.stream?.sort(this.sortByRoleName) ?? []
            return roles
          }),
          catchError((err) => {
            console.error('iam.searchRolesByCriteria', err)
            return of([])
          }),
          finalize(() => this.roleList.emit(roles))
        )
        .subscribe()
    } else if (this.userId) {
      this.roleApi
        .getUserRoles({ userId: this.userId })
        .pipe(
          map((response: UserRolesResponse) => {
            roles = response.roles?.sort(this.sortByRoleName) ?? []
            return roles
          }),
          catchError((err) => {
            console.error('iam.getUserRoles', err)
            return of([])
          }),
          finalize(() => this.roleList.emit(roles))
        )
        .subscribe()
    } else {
      this.roleList.emit(roles)
    }
  }

  public sortByRoleName(a: Role, b: Role): number {
    return (a.name ? a.name.toUpperCase() : '').localeCompare(b.name ? b.name.toUpperCase() : '')
  }
}
