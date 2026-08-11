import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { AsyncPipe } from '@angular/common'
import { Observable } from 'rxjs'
import { TranslateModule } from '@ngx-translate/core'
import { MessageModule } from 'primeng/message'

import { AngularRemoteComponentsModule, SlotService } from '@onecx/angular-remote-components'

@Component({
  selector: 'app-user-permissions',
  standalone: true,
  imports: [AsyncPipe, AngularRemoteComponentsModule, MessageModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-permissions.component.html'
})
export class UserPermissionsComponent {
  @Input() id: string | undefined = 'undefined' // why ever this is required
  @Input() userId: string | undefined = undefined
  @Input() issuer: string | undefined = undefined
  @Input() displayName: string | undefined = undefined

  // target slot: display user->role assignments (in onecx-permission) AND idm roles (in onecx-iam)
  public slotName = 'onecx-iam-user-permissions'
  public isRemoteComponentDefined$: Observable<boolean> | undefined
  public dialogResult: string | undefined = undefined

  constructor(private readonly slotService: SlotService) {
    this.isRemoteComponentDefined$ = this.slotService.isSomeComponentDefinedForSlot(this.slotName)
  }
}
