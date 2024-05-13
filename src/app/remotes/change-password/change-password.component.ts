import { CommonModule, Location } from '@angular/common'
import { HttpClient, HttpClientModule } from '@angular/common/http'
import { Component, Inject } from '@angular/core'
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core'
import {
  AngularRemoteComponentsModule,
  BASE_URL,
  RemoteComponentConfig,
  ocxRemoteComponent,
  provideTranslateServiceForRoot
} from '@onecx/angular-remote-components'
import {
  DialogState,
  PortalCoreModule,
  PortalDialogService,
  PortalMessageService,
  UserService,
  createRemoteComponentTranslateLoader,
  providePortalDialogService
} from '@onecx/portal-integration-angular'
import { Observable, ReplaySubject, catchError, mergeMap, of } from 'rxjs'
import { RippleModule } from 'primeng/ripple'
import { TooltipModule } from 'primeng/tooltip'
import { SharedModule } from 'src/app/shared/shared.module'
import { Configuration, UsersInternalAPIService } from 'src/app/shared/generated'
import { environment } from 'src/environments/environment'
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component'

@Component({
  selector: 'app-ocx-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RippleModule,
    TooltipModule,
    ChangePasswordDialogComponent,
    TranslateModule,
    SharedModule,
    PortalCoreModule,
    AngularRemoteComponentsModule
  ],
  providers: [
    UsersInternalAPIService,
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
export class OneCXChangePasswordComponent implements ocxRemoteComponent {
  permissions: string[] = []

  constructor(
    @Inject(BASE_URL) private baseUrl: ReplaySubject<string>,
    private usersInternalService: UsersInternalAPIService,
    private userService: UserService,
    private portalDialogService: PortalDialogService,
    private msgService: PortalMessageService,
    private translateService: TranslateService
  ) {
    this.userService.lang$.subscribe((lang) => this.translateService.use(lang))
  }

  ocxInitRemoteComponent(config: RemoteComponentConfig): void {
    this.baseUrl.next(config.baseUrl)
    this.permissions = config.permissions
    this.usersInternalService.configuration = new Configuration({
      basePath: Location.joinWithSlash(config.baseUrl, environment.apiPrefix)
    })
  }

  private openChangePasswordEditorDialog(): Observable<DialogState<string>> {
    return this.portalDialogService.openDialog<string>(
      'CHANGE_PASSWORD.DIALOG.TITLE',
      {
        type: ChangePasswordDialogComponent,
        inputs: {}
      },
      {
        key: 'CHANGE_PASSWORD.DIALOG.CHANGE_BUTTON'
      },
      {
        key: 'CHANGE_PASSWORD.DIALOG.CANCEL'
      }
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

  public editPassword(event: any) {
    return this.openChangePasswordEditorDialog()
      .pipe(
        mergeMap((dialogState) => {
          if (dialogState?.button === 'primary') {
            return this.openChangePasswordConfirmationDialog().pipe(
              mergeMap((confirmationState) => {
                if (confirmationState.button === 'primary') return of(dialogState.result)
                return of('')
              })
            )
          }
          return of('')
        }),
        mergeMap((password) => {
          if (!password) return of(false)
          return this.usersInternalService
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
