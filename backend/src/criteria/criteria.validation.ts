import { z, ZodType } from 'zod';

export class CrteriaValidation {
  static readonly GETALL: ZodType = z.object({
    search: z.string().optional(),
    page: z.number().min(1).optional(),
    limit: z.number().min(10).optional(),
    type: z.string().optional(),
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
    type: z
      .string()
      .nonempty('Tipe tidak boleh kosong')
      .max(125, 'Tipe maksimal 125 karakter'),
    weight: z.number().min(0).max(1),
    beasiswaId: z
      .string()
      .nonempty('ID beasiswa tidak boleh kosong')
      .max(32, 'ID beasiswa maksimal 32 karakter'),
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
    type: z
      .string()
      .nonempty('Tipe tidak boleh kosong')
      .max(125, 'Tipe maksimal 125 karakter'),
    weight: z.number().min(0).max(1),
    beasiswaId: z
      .string()
      .nonempty('ID beasiswa tidak boleh kosong')
      .max(32, 'ID beasiswa maksimal 32 karakter'),
  });
  static readonly TYPE: ZodType = z.object({
    type: z
      .string()
      .nonempty('Tipe tidak boleh kosong')
      .max(32, 'Tipe maksimal 32 karakter'),
  });
}
