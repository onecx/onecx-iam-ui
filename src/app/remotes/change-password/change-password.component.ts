import { Component, Inject, Input } from '@angular/core'
import { CommonModule, Location } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core'
import { Observable, ReplaySubject, catchError, mergeMap, of } from 'rxjs'
import { RippleModule } from 'primeng/ripple'
import { TooltipModule } from 'primeng/tooltip'

import {
  AngularRemoteComponentsModule,
  BASE_URL,
  RemoteComponentConfig,
  ocxRemoteComponent,
  provideTranslateServiceForRoot,
  ocxRemoteWebcomponent
} from '@onecx/angular-remote-components'
import { UserService } from '@onecx/angular-integration-interface'
import {
  DialogState,
  PortalCoreModule,
  PortalDialogService,
  PortalMessageService,
  createRemoteComponentTranslateLoader,
  providePortalDialogService
} from '@onecx/portal-integration-angular'

import { SharedModule } from 'src/app/shared/shared.module'
import { Configuration, UserInternalAPIService } from 'src/app/shared/generated'
import { environment } from 'src/environments/environment'

import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component'

@Component({
  selector: 'app-ocx-change-password',
  templateUrl: './change-password.component.html',
  standalone: true,
  imports: [
    CommonModule,
    RippleModule,
    TooltipModule,
    TranslateModule,
    SharedModule,
    PortalCoreModule,
    AngularRemoteComponentsModule
  ],
  providers: [
    UserInternalAPIService,
    PortalMessageService,
    providePortalDialogService(),
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
export class OneCXChangePasswordComponent implements ocxRemoteComponent, ocxRemoteWebcomponent {
  permissions: string[] = []

  constructor(
    @Inject(BASE_URL) private readonly baseUrl: ReplaySubject<string>,
    private readonly userService: UserService,
    private readonly iamUserService: UserInternalAPIService,
    private readonly portalDialogService: PortalDialogService,
    private readonly msgService: PortalMessageService,
    private readonly translateService: TranslateService
  ) {
    this.userService.lang$.subscribe((lang) => this.translateService.use(lang))
  }

  @Input() set ocxRemoteComponentConfig(config: RemoteComponentConfig) {
    this.ocxInitRemoteComponent(config)
  }

  ocxInitRemoteComponent(config: RemoteComponentConfig): void {
    this.baseUrl.next(config.baseUrl)
    this.permissions = config.permissions
    this.iamUserService.configuration = new Configuration({
      basePath: Location.joinWithSlash(config.baseUrl, environment.apiPrefix)
    })
  }

  private openChangePasswordEditorDialog(): Observable<DialogState<string>> {
    return this.portalDialogService.openDialog<string>(
      'CHANGE_PASSWORD.DIALOG.TITLE',
      ChangePasswordDialogComponent,
      'CHANGE_PASSWORD.DIALOG.CHANGE_BUTTON',
      'CHANGE_PASSWORD.DIALOG.CANCEL'
    )
  }

  private openChangePasswordConfirmationDialog() {
    return this.portalDialogService.openDialog(
      'CHANGE_PASSWORD.CONFIRM_DIALOG.TITLE',
      'CHANGE_PASSWORD.CONFIRM_DIALOG.MESSAGE',
      'CHANGE_PASSWORD.CONFIRM_DIALOG.YES',
      'CHANGE_PASSWORD.CONFIRM_DIALOG.NO'
    )
  }

  public onEnterClick() {
    return this.editPassword({})
  }

  public editPassword(event: any) {
    return this.openChangePasswordEditorDialog()
      .pipe(
        mergeMap((dialogState) => {
          if (dialogState?.button === 'primary') {
            return this.openChangePasswordConfirmationDialog().pipe(
              mergeMap((confirmationState) => {
                if (confirmationState?.button === 'primary') return of(dialogState.result)
                return of('')
              })
            )
          }
          return of('')
        }),
        mergeMap((password) => {
          if (!password) return of(false)
          return this.iamUserService
            .resetPassword({
              userResetPasswordRequest: { password: password }
            })
            .pipe(
              catchError(() => {
                this.msgService.error({ summaryKey: 'CHANGE_PASSWORD.PASSWORD_CHANGE_ERROR' })
                return of()
              }),
              mergeMap(() => of(true))
            )
        })
      )
      .subscribe((confirmed) => {
        if (confirmed) this.msgService.success({ summaryKey: 'CHANGE_PASSWORD.PASSWORD_CHANGED_SUCCESSFULLY' })
      })
  }
}
