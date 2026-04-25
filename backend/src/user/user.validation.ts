import { z, ZodType } from 'zod';

export class UserValidation {
  static readonly GETALL: ZodType = z.object({
    search: z.string().optional(),
    page: z.number().min(1).optional(),
    limit: z.number().min(10).optional(),
    status: z.string().optional(),
  });

  static readonly CREATE: ZodType = z.object({
    nim: z
      .string()
      .min(5, 'NIM minimal 5 karakter')
      .max(32, 'NIM maksimal 32 karakter'),
    fullname: z
      .string()
      .max(100, 'Nama Lengkap maksimal 100 karakter')
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          return val.length >= 5;
        },
        {
          message: 'Nama Lengkap minimal 5 karakter',
        },
      ),

    photo: z.string().optional(),
    status: z
      .string()
      .nonempty('Status tidak boleh kosong')
      .min(3, 'Status minimal 3 karakter')
      .max(100, 'Status maksimal 100 karakter')
      .optional(),
    email: z.string().email('Email tidak valid').optional(),
    prodi: z
      .string()
      .max(100, 'Program Studi maksimal 100 karakter')
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          return val.length >= 5;
        },
        {
          message: 'Program Studi minimal 5 karakter',
        },
      ),
    batch: z
      .number()
      .max(9999, 'Tahun angkatan maksimal 9999')
      .nullable()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          return val >= 1900;
        },
        {
          message: 'Tahun angkatan minimal 1900',
        },
      ),
    password: z
      .string()
      .nonempty('Kata sandi tidak boleh kosong')
      .min(5, 'Kata sandi minimal 5 karakter')
      .max(100, 'Kata sandi maksimal 100 karakter')
      .refine(
        (val) => {
          if (!val) return true;
          return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.test(val);
        },
        {
          message: 'Password harus mengandung huruf dan angka',
        },
      ),
  });

  static readonly PUT: ZodType = z.object({
    nim: z
      .string()
      .nonempty('NIM tidak boleh kosong')
      .min(5, 'NIM minimal 5 karakter')
      .max(32, 'NIM maksimal 32 karakter'),
    fullname: z
      .string()
      .max(100, 'Nama Lengkap maksimal 100 karakter')
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          return val.length >= 5;
        },
        {
          message: 'Nama Lengkap minimal 5 karakter',
        },
      ),
    prodi: z
      .string()
      .max(100, 'Program Studi maksimal 100 karakter')
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          return val.length >= 5;
        },
        {
          message: 'Program Studi minimal 5 karakter',
        },
      ),
    batch: z
      .number()

      .max(9999, 'Tahun angkatan maksimal 9999')
      .nullable()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          return val >= 1900;
        },
        {
          message: 'Tahun angkatan minimal 1900',
        },
      ),
    photo: z.string().optional(),
    status: z
      .string()
      .nonempty('Status tidak boleh kosong')
      .min(3, 'Status minimal 3 karakter')
      .max(100, 'Status maksimal 100 karakter')
      .optional(),
    email: z.string().email('Email tidak valid').optional(),
    password: z
      .string()
      .max(100, 'Kata sandi maksimal 100 karakter')
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          return val.length >= 5;
        },
        {
          message: 'Password minimal 5 karakter',
        },
      )
      .refine(
        (val) => {
          if (!val) return true;
          return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.test(val);
        },
        {
          message: 'Password harus mengandung huruf dan angka',
        },
      ),
  });
  static readonly STATUS: ZodType = z.object({
    nim: z
      .string()
      .min(5, 'NIM minimal 5 karakter')
      .max(32, 'NIM maksimal 32 karakter'),
  });

  static readonly EditProfie: ZodType = z.object({
    fullname: z.string().min(1),
    email: z.string().min(1),
    photo: z.string().optional(),
  });

  static readonly ChangePassword: ZodType = z.object({
    password: z.string().min(1),
    newPassword: z.string().min(1),
  });
}
