import { Component, EventEmitter, Output } from '@angular/core'
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'
import {
  DialogButtonClicked,
  DialogPrimaryButtonDisabled,
  DialogResult,
  DialogState
} from '@onecx/portal-integration-angular'
import { InputTextModule } from 'primeng/inputtext'
import { PasswordModule } from 'primeng/password'
import { Observable } from 'rxjs'

@Component({
  selector: 'app-ocx-change-password-dialog',
  standalone: true,
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss'],
  imports: [InputTextModule, PasswordModule, ReactiveFormsModule, TranslateModule],
  providers: [FormBuilder]
})
export class ChangePasswordDialogComponent
  implements DialogPrimaryButtonDisabled, DialogResult<string>, DialogButtonClicked
{
  public formGroup!: FormGroup
  dialogResult: string = ''
  @Output() primaryButtonEnabled: EventEmitter<boolean> = new EventEmitter()

  constructor(private fb: FormBuilder) {
    this.formGroup = this.fb.group(
      {
        password: new FormControl(null, [Validators.required]),
        repeatPassword: new FormControl(null, [Validators.required])
      },
      {
        validator: this.matchPasswords('password', 'repeatPassword')
      }
    )
  }

  public matchPasswords(firstField: string, secondField: string): (control: AbstractControl) => void {
    return (control: AbstractControl): void => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (control.get(firstField)?.value && control.get(firstField)!.value === control.get(secondField)!.value) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        control.get(secondField)!.setErrors(null)
        this.primaryButtonEnabled.emit(true)
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        control.get(secondField)!.setErrors({ notEqual: true })
        this.primaryButtonEnabled.emit(false)
      }
    }
  }

  ocxDialogButtonClicked(state: DialogState<unknown>): boolean | Observable<boolean> | Promise<boolean> | undefined {
    this.dialogResult = this.formGroup.value['password']
    return true
  }
}
