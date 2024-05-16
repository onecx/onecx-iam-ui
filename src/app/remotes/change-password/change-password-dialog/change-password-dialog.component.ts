import { Component, EventEmitter, Output } from '@angular/core'
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'
import { DialogPrimaryButtonDisabled, DialogResult } from '@onecx/portal-integration-angular'
import { InputTextModule } from 'primeng/inputtext'
import { PasswordModule } from 'primeng/password'

@Component({
  selector: 'app-ocx-change-password-dialog',
  standalone: true,
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss'],
  imports: [InputTextModule, PasswordModule, ReactiveFormsModule, TranslateModule],
  providers: [FormBuilder]
})
export class ChangePasswordDialogComponent implements DialogPrimaryButtonDisabled, DialogResult<string> {
  public formGroup!: FormGroup
  dialogResult: string = ''
  @Output() primaryButtonEnabled: EventEmitter<boolean> = new EventEmitter()

  constructor(private fb: FormBuilder) {
    this.formGroup = this.fb.group(
      {
        password: new FormControl<string>('', [Validators.required]),
        repeatPassword: new FormControl<string>('', [Validators.required])
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
        this.dialogResult = control.get(firstField)?.value
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        control.get(secondField)!.setErrors({ notEqual: true })
        this.primaryButtonEnabled.emit(false)
        this.dialogResult = ''
      }
    }
  }
}
