export * from './rolesInternal.service';
import { RolesInternalAPIService } from './rolesInternal.service';
export * from './usersInternal.service';
import { UsersInternalAPIService } from './usersInternal.service';
export const APIS = [RolesInternalAPIService, UsersInternalAPIService];
