import z, { ZodType } from 'zod';

export class AlternativeValueValidation {
  static readonly GETALL: ZodType = z.object({
    search: z.string().optional(),
    page: z.number().min(1).optional(),
    limit: z.number().min(10).optional(),
    kodeAlternatif: z.string().optional(),
    kodeKriteria: z.string().optional(),
  });
  static readonly CREATE: ZodType = z.object({
    kodeAlternatif: z
      .string()
      .nonempty('Kode alternatif tidak boleh kosong')
      .max(5),

    nilaiAlternatif: z
      .array(
        z.object({
          kodeKriteria: z
            .string()
            .nonempty('Kode kriteria tidak boleh kosong')
            .max(5),

          nilai: z.number('').min(0, 'Nilai minimal 0'),
        }),
      )
      .min(1, 'Minimal 1 nilai harus diisi'),
  });
  static readonly PUT: ZodType = z.object({
    kodeAlternatif: z
      .string()
      .nonempty('Kode alternatif tidak boleh kosong')
      .max(5),

    nilaiAlternatif: z
      .array(
        z.object({
          kodeKriteria: z
            .string()
            .nonempty('Kode kriteria tidak boleh kosong')
            .max(5),

          nilai: z.number('').min(0, 'Nilai minimal 0'),
        }),
      )
      .min(1, 'Minimal 1 nilai harus diisi'),
  });
}
