import z, { ZodType } from 'zod';

export class BeasiswaValidation {
  static readonly GETALL: ZodType = z.object({
    search: z.string().optional(),
    page: z.number().min(1).optional(),
    limit: z.number().min(10).optional(),
    status: z.string().optional(),
  });
  static readonly CREATE: ZodType = z.object({
    code: z
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
    name: z
      .string()
      .nonempty('Nama tidak boleh kosong')
      .max(125, 'Nama maksimal 125 karakter'),
    description: z
      .string()
      .nonempty('Deskripsi tidak boleh kosong')
      .max(1000, 'Deskripsi maksimal 1000 karakter'),
    period: z
      .string()
      .nonempty('Periode tidak boleh kosong')
      .max(255, 'Periode maksimal 25 karakter'),
    isActive: z.boolean(),
  });
  static readonly PUT: ZodType = z.object({
    code: z
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
    name: z
      .string()
      .nonempty('Nama tidak boleh kosong')
      .max(125, 'Nama maksimal 125 karakter'),
    description: z
      .string()
      .nonempty('Deskripsi tidak boleh kosong')
      .max(1000, 'Deskripsi maksimal 1000 karakter'),
    period: z
      .string()
      .nonempty('Periode tidak boleh kosong')
      .max(255, 'Periode maksimal 25 karakter'),
    isActive: z.boolean(),
  });
  static readonly STATUS: ZodType = z.object({
    isActive: z.boolean(),
  });
}
