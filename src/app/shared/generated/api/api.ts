export * from './adminInternal.service';
import { AdminInternalAPIService } from './adminInternal.service';
export * from './userInternal.service';
import { UserInternalAPIService } from './userInternal.service';
export const APIS = [AdminInternalAPIService, UserInternalAPIService];
