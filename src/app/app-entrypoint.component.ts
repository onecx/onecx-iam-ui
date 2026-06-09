import { Component } from '@angular/core'
import { RouterModule } from '@angular/router'

@Component({
  selector: 'app-root',
  templateUrl: './app-entrypoint.component.html',
  standalone: true,
  imports: [RouterModule]
})
export class AppEntrypointComponent {}
