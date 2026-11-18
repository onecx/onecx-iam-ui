import { Component, DestroyRef, EventEmitter, inject, Input, OnChanges } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { Location } from '@angular/common'
import { TranslateService } from '@ngx-translate/core'
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
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-iam-user-roles',
  standalone: true,
  imports: [AngularRemoteComponentsModule],
  providers: [
    {
      provide: REMOTE_COMPONENT_CONFIG,
      useValue: new ReplaySubject<RemoteComponentConfig>(1)
    }
  ],
  template: '' // RC provides only data
})
export class OneCXIamUserRolesComponent implements ocxRemoteComponent, ocxRemoteWebcomponent, OnChanges {
  @Input() userId: string | undefined = undefined
  @Input() issuer: string | undefined = undefined
  @Input() refresh: boolean | undefined = false // on any change here a reload is triggered
  @Input() roleList = new EventEmitter<Role[]>() // provided in slot (output)

  public iamRoles$: Observable<Role[]> | undefined

  private readonly remoteComponentConfig = inject<ReplaySubject<RemoteComponentConfig>>(REMOTE_COMPONENT_CONFIG)
  private readonly userService = inject(UserService)
  private readonly translateService = inject(TranslateService)
  private readonly adminApi = inject(AdminInternalAPIService)
  private readonly destroyRef = inject(DestroyRef)

  constructor() {
    this.userService.lang$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((lang) => this.translateService.use(lang))
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
        takeUntilDestroyed(this.destroyRef),
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
              finalize(() => this.roleList.emit(roles))
            )
        )
      )
      this.iamRoles$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe()
    } else if (this.userId && this.issuer) {
      this.adminApi
        .getUserRoles({ userId: this.userId, searchUserRolesRequest: { issuer: this.issuer } })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response: UserRolesResponse) => {
            roles = response.roles?.sort(this.sortByRoleName) ?? []
            this.roleList.emit(roles)
          },
          error: (err) => {
            console.error('iam.getUserRoles', err)
            this.roleList.emit([])
          }
        })
    } else {
      this.roleList.emit(roles)
    }
  }

  public sortByRoleName(a: Role, b: Role): number {
    return (a.name ? a.name.toUpperCase() : '').localeCompare(b.name ? b.name.toUpperCase() : '')
  }
}
