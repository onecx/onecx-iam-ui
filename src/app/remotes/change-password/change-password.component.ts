import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'
import { AbstractControl } from '@angular/forms'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import {
  AngularRemoteComponentsModule,
  BASE_URL,
  RemoteComponentConfig,
  ocxRemoteComponent,
  provideTranslateServiceForRoot
} from '@onecx/angular-remote-components'
import {
  PortalCoreModule,
  PortalMessageService,
  createRemoteComponentTranslateLoader
} from '@onecx/portal-integration-angular'
import { ReplaySubject, of } from 'rxjs'
import { SharedModule } from 'src/app/shared/shared.module'
// import { IAMAPIService, ResetPasswordRequestParams, UserResetPasswordRequest } from 'src/app/shared/generated'
// import { UserProfileService } from '../user-profile.service'

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
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
export class ChangePasswordComponent implements OnInit, ocxRemoteComponent {
  // public passwordChangeForm!: UntypedFormGroup
  // public helpArticleId = 'PAGE_SELF_REGISTRATION_PASSWORD_CHANGE'
  // public translatedData: any

  constructor(
    // private readonly fb: UntypedFormBuilder,
    // private readonly userProfileService: UserProfileService,
    // private readonly iamService: IAMAPIService,
    private msgService: PortalMessageService
  ) {}

  public ngOnInit(): void {
    console.log('a')
    // this.buildForm()
  }

  ocxInitRemoteComponent(config: RemoteComponentConfig): void {}

  public onSubmit(): void {
    // const userResetPasswordRequest: UserResetPasswordRequest = {
    //   password: this.passwordChangeForm.get('password')?.value
    // }
    // let resetPasswordRequestParams: ResetPasswordRequestParams = {
    //   userResetPasswordRequest: userResetPasswordRequest
    // }
    // IAM HTTP service call
    of(true).subscribe(
      () => {
        this.msgService.success({ summaryKey: 'CHANGE_PASSWORD.PASSWORD_CHANGED_SUCCESSFULLY' })
      },
      () => {
        this.msgService.error({ summaryKey: 'CHANGE_PASSWORD.PASSWORD_CHANGE_ERROR' })
      }
    )
  }

  // private buildForm(): void {
  //   this.passwordChangeForm = this.fb.group(
  //     {
  //       password: ['', Validators.required],
  //       repeatPassword: ['', Validators.required]
  //     },
  //     {
  //       validator: this.matchPasswords('password', 'repeatPassword')
  //     }
  //   )
  // }

  public matchPasswords(firstField: string, secondField: string): (control: AbstractControl) => void {
    return (control: AbstractControl): void => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (control.get(firstField)!.value === control.get(secondField)!.value) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        control.get(secondField)!.setErrors(null)
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        control.get(secondField)!.setErrors({ notEqual: true })
      }
    }
  }
}
