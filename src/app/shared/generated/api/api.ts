export * from './realmsInternal.service';
import { RealmsInternalAPIService } from './realmsInternal.service';
export * from './rolesInternal.service';
import { RolesInternalAPIService } from './rolesInternal.service';
export * from './usersInternal.service';
import { UsersInternalAPIService } from './usersInternal.service';
export const APIS = [RealmsInternalAPIService, RolesInternalAPIService, UsersInternalAPIService];
