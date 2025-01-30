import { UserManagementService } from '../service/user-management.service';

export class AuthController {
  constructor(private readonly userManagementService: UserManagementService) {}
}
