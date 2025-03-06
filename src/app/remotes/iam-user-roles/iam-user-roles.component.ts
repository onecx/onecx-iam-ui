import { Component, EventEmitter, Inject, Input, OnChanges } from '@angular/core'
import { CommonModule, Location } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { RouterModule } from '@angular/router'
import { UntilDestroy } from '@ngneat/until-destroy'
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core'
import { catchError, finalize, map, Observable, of, ReplaySubject } from 'rxjs'
import { PanelMenuModule } from 'primeng/panelmenu'

import {
  AngularRemoteComponentsModule,
  BASE_URL,
  RemoteComponentConfig,
  ocxRemoteComponent,
  ocxRemoteWebcomponent,
  provideTranslateServiceForRoot
} from '@onecx/angular-remote-components'
import { PortalCoreModule, UserService, createRemoteComponentTranslateLoader } from '@onecx/portal-integration-angular'

import { Configuration, UserRolesResponse, RolesInternalAPIService } from 'src/app/shared/generated'
import { SharedModule } from 'src/app/shared/shared.module'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-iam-user-roles',
  templateUrl: './iam-user-roles.component.html',
  standalone: true,
  imports: [
    AngularRemoteComponentsModule,
    CommonModule,
    PortalCoreModule,
    RouterModule,
    TranslateModule,
    SharedModule,
    PanelMenuModule
  ],
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
  @Input() roleList = new EventEmitter<string[]>() // provided in slot (output)

  public iamRoles$: Observable<string[]> | undefined

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

  ngOnChanges(): void {
    if (this.userId) {
      const roles: string[] = []
      this.roleApi
        .getUserRoles({ userId: this.userId })
        .pipe(
          map((response: UserRolesResponse) => {
            response.roles?.forEach((r) => roles.push(r.name!))
            roles.sort()
            return roles
          }),
          catchError((err) => {
            console.error('iam.getUserRoles', err)
            return of([])
          }),
          finalize(() => this.roleList.emit(roles))
        )
        .subscribe()
    }
  }
}
