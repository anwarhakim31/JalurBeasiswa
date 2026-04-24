import z, { ZodType } from 'zod';

export class AlternativeValidation {
  static readonly GETALL: ZodType = z.object({
    search: z.string().optional(),
    page: z.number().min(1).optional(),
    limit: z.number().min(10).optional(),
    status: z.string().optional(),
  });
  static readonly CREATE: ZodType = z.object({
    nim: z
      .string()
      .nonempty('NIM tidak boleh kosong')
      .min(5, 'NIM minimal 5 karakter')
      .max(32, 'NIM maksimal 32 karakter'),
    beasiswaId: z
      .string()
      .nonempty('ID beasiswa tidak boleh kosong')
      .max(32, 'ID beasiswa maksimal 32 karakter'),
  });
  static readonly PUT: ZodType = z.object({
    nim: z
      .string()
      .nonempty('NIM tidak boleh kosong')
      .min(5, 'NIM minimal 5 karakter')
      .max(32, 'NIM maksimal 32 karakter'),
    beasiswaId: z
      .string()
      .nonempty('ID beasiswa tidak boleh kosong')
      .max(32, 'ID beasiswa maksimal 32 karakter'),
  });
}
