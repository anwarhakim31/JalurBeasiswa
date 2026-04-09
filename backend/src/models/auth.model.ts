export class RegisterRequest {
  email: string;
  nim: string;
  password: string;
}

export class LoginRequest {
  'nim/email': string;
  password: string;
}

export class ForgetRequest {
  nim: string;
  email: string;
  newPassword: string;
}
export class AuthResponse {
  nim: string;
  fullname?: string;
  email: string;
  photo?: string;
  isAdmin?: boolean;
}
