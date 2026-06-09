import { Component, EventEmitter, Inject, Input, OnChanges } from '@angular/core'
import { CommonModule, Location } from '@angular/common'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { catchError, finalize, filter, map, mergeMap, Observable, of, ReplaySubject } from 'rxjs'

import {
  AngularRemoteComponentsModule,
  ocxRemoteComponent,
  ocxRemoteWebcomponent
} from '@onecx/angular-remote-components'
import { REMOTE_COMPONENT_CONFIG, RemoteComponentConfig } from '@onecx/angular-utils'
import { UserService } from '@onecx/angular-integration-interface'

import {
  Configuration,
  Role,
  AdminInternalAPIService,
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
  imports: [AngularRemoteComponentsModule, CommonModule, TranslateModule, SharedModule],
  providers: [
    {
      provide: REMOTE_COMPONENT_CONFIG,
      useValue: new ReplaySubject<RemoteComponentConfig>(1)
    }
  ]
})
@UntilDestroy()
export class OneCXIamUserRolesComponent implements ocxRemoteComponent, ocxRemoteWebcomponent, OnChanges {
  @Input() userId: string | undefined = undefined
  @Input() issuer: string | undefined = undefined
  @Input() refresh: boolean | undefined = false // on any change here a reload is triggered
  @Input() roleList = new EventEmitter<Role[]>() // provided in slot (output)

  public iamRoles$: Observable<Role[]> | undefined

  constructor(
    @Inject(REMOTE_COMPONENT_CONFIG) private readonly remoteComponentConfig: ReplaySubject<RemoteComponentConfig>,
    private readonly userService: UserService,
    private readonly translateService: TranslateService,
    private readonly adminApi: AdminInternalAPIService
  ) {
    this.userService.lang$.subscribe((lang) => this.translateService.use(lang))
  }

  @Input() set ocxRemoteComponentConfig(config: RemoteComponentConfig) {
    this.ocxInitRemoteComponent(config)
  }

  ocxInitRemoteComponent(remoteComponentConfig: RemoteComponentConfig) {
    this.remoteComponentConfig.next(remoteComponentConfig)
    this.adminApi.configuration = new Configuration({
      basePath: Location.joinWithSlash(remoteComponentConfig.baseUrl, environment.apiPrefix)
    })
  }

  public ngOnChanges(): void {
    let roles: Role[] = []
    if (this.userId === '$$ocx-iam-roles-search-all-indicator$$') {
      this.iamRoles$ = this.userService.profile$.pipe(
        filter((x) => x !== undefined),
        untilDestroyed(this),
        mergeMap((profile) =>
          this.adminApi
            .searchRolesByCriteria({
              roleSearchCriteria: { issuer: profile.issuer, pageSize: 1000 } as RoleSearchCriteria
            })
            .pipe(
              map((response: RolePageResult) => {
                roles = response.stream?.sort(this.sortByRoleName) ?? []
                return roles
              }),
              catchError((err) => {
                console.error('iam.searchRolesByCriteria', err)
                return of([])
              }),
              finalize(() => {
                this.roleList.emit(roles)
              })
            )
        )
      )
      this.iamRoles$.subscribe()
    } else if (this.userId && this.issuer) {
      this.adminApi
        .getUserRoles({ userId: this.userId, searchUserRolesRequest: { issuer: this.issuer } })
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
