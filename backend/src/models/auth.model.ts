export class RegisterRequest {
  email: string;
  nim: string;
  kataSandi: string;
}

export class LoginRequest {
  'nim/email': string;
  kataSandi: string;
}

export class ForgetRequest {
  nim: string;
  email: string;
  kataSandiBaru: string;
}
export class AuthResponse {
  nim: string;
  namaLengkap?: string;
  email: string;
  foto?: string;
  admin?: boolean;
}
