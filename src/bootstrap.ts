import { bootstrapModule } from '@onecx/angular-webcomponents'
import { environment } from 'src/environments/environment'
import { OneCXIamModule } from './app/onecx-iam-remote.module'

bootstrapModule(OneCXIamModule, 'microfrontend', environment.production)
