import z, { ZodType } from 'zod';

export class AlternativeValidation {
  static readonly GETALL: ZodType = z.object({
    search: z.string().optional(),
    page: z.number().min(1).optional(),
    limit: z.number().min(10).optional(),
    status: z.string().optional(),
    kodeBeasiswa: z.string().optional(),
  });
  static readonly CREATE: ZodType = z.object({
    kode: z
      .string()
      .nonempty('Kode tidak boleh kosong')
      .max(6, 'Kode maksimal 6 karakter')
      .refine(
        (val) => {
          if (!val) return true;
          return /^[a-zA-Z0-9]+$/.test(val);
        },
        {
          message: 'Kode harus mengandung angka dan huruf',
        },
      ),
    nim: z
      .string()
      .nonempty('NIM tidak boleh kosong')
      .min(5, 'NIM minimal 5 karakter')
      .max(32, 'NIM maksimal 32 karakter'),
    kodeBeasiswa: z
      .string()
      .nonempty('Kode beasiswa tidak boleh kosong')
      .max(5, 'Kode beasiswa maksimal 5 karakter'),
  });
  static readonly PUT: ZodType = z.object({
    kode: z
      .string()
      .nonempty('Kode tidak boleh kosong')
      .max(6, 'Kode maksimal 6 karakter')
      .refine(
        (val) => {
          if (!val) return true;
          return /^[a-zA-Z0-9]+$/.test(val);
        },
        {
          message: 'Kode harus mengandung angka dan huruf',
        },
      ),
    nim: z
      .string()
      .nonempty('NIM tidak boleh kosong')
      .min(5, 'NIM minimal 5 karakter')
      .max(32, 'NIM maksimal 32 karakter'),
    kodeBeasiswa: z
      .string()
      .nonempty('Kode beasiswa tidak boleh kosong')
      .max(5, 'Kode beasiswa maksimal 5 karakter'),
  });
}
