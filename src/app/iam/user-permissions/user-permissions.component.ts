import { Component, Input } from '@angular/core'
import { Observable } from 'rxjs'

import { SlotService } from '@onecx/angular-remote-components'

@Component({
  selector: 'app-user-permissions',
  templateUrl: './user-permissions.component.html'
})
export class UserPermissionsComponent {
  @Input() id: string | undefined = 'undefined' // why ever this is required
  @Input() userId: string | undefined = undefined
  @Input() displayName: string | undefined = undefined

  public slotName = 'onecx-iam-user-permissions'
  public isRemoteComponentDefined$: Observable<boolean> | undefined
  public dialogResult: string | undefined = undefined

  constructor(private readonly slotService: SlotService) {
    this.isRemoteComponentDefined$ = this.slotService.isSomeComponentDefinedForSlot(this.slotName)
  }
}
