import z, { ZodType } from 'zod';

export class AlternativeValueValidation {
  static readonly GETALL: ZodType = z.object({
    search: z.string().optional(),
    page: z.number().min(1).optional(),
    limit: z.number().min(10).optional(),
  });
  static readonly CREATE: ZodType = z.object({
    alternativeCode: z
      .string()
      .nonempty('Kode alternatif tidak boleh kosong')
      .max(5),

    values: z
      .array(
        z.object({
          kriteriaCode: z
            .string()
            .nonempty('Kode kriteria tidak boleh kosong')
            .max(5),

          value: z.number('').min(0, 'Nilai minimal 0'),
        }),
      )
      .min(1, 'Minimal 1 nilai harus diisi'),
  });
  static readonly PUT: ZodType = z.object({
    alternativeCode: z
      .string()
      .nonempty('Kode alternatif tidak boleh kosong')
      .max(5),

    values: z
      .array(
        z.object({
          kriteriaCode: z
            .string()
            .nonempty('Kode kriteria tidak boleh kosong')
            .max(5),

          value: z.number('').min(0, 'Nilai minimal 0'),
        }),
      )
      .min(1, 'Minimal 1 nilai harus diisi'),
  });
}
