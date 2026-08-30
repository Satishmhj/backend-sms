import { UserRole } from '../../user/schemas/user.schema';

export interface ILoginParams {
  // email: string;
  username: string;
  password: string;
}

export interface ISignupParams {
  name: string;
  email: string;
  // username: string;
  password: string;
  role: UserRole;
  class?: string;
  rollNumber?: string;
  subjects?: string[];
  department?: string;
}

export interface IAuthResponse {
  access_token: string;
  user: {
    _id: string;
    name: string;
    username: string
    email: string;
    role: UserRole;
    class?: string;
    rollNumber?: string;
    subjects?: string[];
    department?: string;
  };
}
