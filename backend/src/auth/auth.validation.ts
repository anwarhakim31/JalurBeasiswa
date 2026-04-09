import { z, ZodType } from 'zod';

export class AuthValidation {
  static readonly REGISTER: ZodType = z.object({
    nim: z
      .string()
      .min(1, 'NIM harus diisi')
      .max(32, 'NIM maksimal 32 karakter'),
    email: z.string().min(1, 'Email harus diisi').email('Email tidak valid'),
    password: z
      .string()
      .min(1, 'Kata sandi harus diisi')
      .max(100, 'Kata sandi maksimal 100 karakter'),
  });

  static readonly LOGIN: ZodType = z.object({
    'nim/email': z
      .string()
      .min(1, 'NIM/Email harus diisi')
      .max(100, 'NIM/Email maksimal 100 karakter'),
    password: z
      .string()
      .min(1, 'Kata sandi harus diisi')
      .max(100, 'Kata sandi maksimal 100 karakter'),
  });

  static readonly FORGET: ZodType = z.object({
    email: z
      .string()
      .email('Email tidak valid')
      .min(1, 'Email harus diisi')
      .max(100, 'Email maksimal 100 karakter'),
    nim: z
      .string()
      .min(1, 'NIM harus diisi')
      .max(32, 'NIM maksimal 32 karakter'),
    newPassword: z
      .string()
      .min(1, 'Kata sandi harus diisi')
      .max(100, 'Kata sandi maksimal 100 karakter'),
  });
}
