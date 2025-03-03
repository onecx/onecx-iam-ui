import { Component, Input, OnInit } from '@angular/core'
import { Observable } from 'rxjs'

import { SlotService, SlotComponentConfiguration } from '@onecx/angular-remote-components'

@Component({
  selector: 'app-user-permissions',
  templateUrl: './user-permissions.component.html'
})
export class UserPermissionsComponent implements OnInit {
  @Input() id: string | undefined = 'undefined' // why ever this is required
  @Input() userId: string | undefined = undefined
  @Input() displayName: string | undefined = undefined

  public slotName = 'onecx-iam-user-permissions'
  public isRemoteComponentDefined$: Observable<boolean> | undefined
  public components$: Observable<SlotComponentConfiguration[]> | undefined
  public dialogResult: string | undefined = undefined

  constructor(private readonly slotService: SlotService) {
    console.log('iam user permissions')
    this.isRemoteComponentDefined$ = this.slotService.isSomeComponentDefinedForSlot(this.slotName)
    this.components$ = this.slotService.getComponentsForSlot(this.slotName)
  }

  ngOnInit(): void {
    console.log(this.displayName)
  }
}
