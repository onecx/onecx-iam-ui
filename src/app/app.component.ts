import { Component } from '@angular/core'
import { RouterModule } from '@angular/router'

import { StandaloneShellModule } from '@onecx/angular-standalone-shell'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [RouterModule, StandaloneShellModule]
})
export class AppComponent {
  title = 'onecx-ui'
}
