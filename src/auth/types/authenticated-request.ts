import { Request } from 'express';
import type { ICurrentUser } from '../decorators/current-user.decorator';

export interface AuthenticatedRequest extends Request {
  user: ICurrentUser;
}
