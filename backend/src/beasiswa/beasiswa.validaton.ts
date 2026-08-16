import z, { ZodType } from 'zod';

export class BeasiswaValidation {
  static readonly GETALL: ZodType = z.object({
    search: z.string().optional(),
    page: z.number().min(1).optional(),
    limit: z.number().min(10).optional(),
    status: z.string().optional(),
  });
  static readonly CREATE: ZodType = z
    .object({
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
      nama: z
        .string()
        .nonempty('Nama tidak boleh kosong')
        .max(125, 'Nama maksimal 125 karakter'),
      deskripsi: z
        .string()
        .nonempty('Deskripsi tidak boleh kosong')
        .max(1000, 'Deskripsi maksimal 1000 karakter'),
      tanggalMulai: z
        .date()
        .min(new Date(), 'Tanggal mulai tidak boleh sebelum Tanggal ini'),
      tanggalSelesai: z
        .date()
        .min(new Date(), 'Tanggal selesai tidak boleh sebelum Tanggal ini'),
      status: z.boolean(),
    })
    .refine(
      (val) => {
        if (!val.tanggalMulai || !val.tanggalSelesai) return true;
        return val.tanggalMulai <= val.tanggalSelesai;
      },
      {
        message: 'Tanggal selesai tidak boleh sebelum Tanggal mulai',
        path: ['tanggalSelesai'],
      },
    )
    .refine(
      (val) => {
        if (!val.tanggalMulai || !val.tanggalSelesai) return true;
        return val.tanggalMulai !== val.tanggalSelesai;
      },
      {
        message: 'Tanggal mulai dan selesai tidak boleh sama',
        path: ['tanggalMulai', 'tanggalSelesai'],
      },
    );
  static readonly PUT: ZodType = z
    .object({
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
      nama: z
        .string()
        .nonempty('Nama tidak boleh kosong')
        .max(125, 'Nama maksimal 125 karakter'),
      deskripsi: z
        .string()
        .nonempty('Deskripsi tidak boleh kosong')
        .max(1000, 'Deskripsi maksimal 1000 karakter'),
      tanggalMulai: z
        .date()
        .min(new Date(), 'Tanggal mulai tidak boleh sebelum Tanggal ini'),
      tanggalSelesai: z
        .date()
        .min(new Date(), 'Tanggal selesai tidak boleh sebelum Tanggal ini'),
      status: z.boolean(),
    })
    .refine(
      (val) => {
        if (!val.tanggalMulai || !val.tanggalSelesai) return true;
        return val.tanggalMulai <= val.tanggalSelesai;
      },
      {
        message: 'Tanggal selesai tidak boleh sebelum Tanggal mulai',
        path: ['tanggalSelesai'],
      },
    )
    .refine(
      (val) => {
        if (!val.tanggalMulai || !val.tanggalSelesai) return true;
        return val.tanggalMulai !== val.tanggalSelesai;
      },
      {
        message: 'Tanggal mulai dan selesai tidak boleh sama',
        path: ['tanggalMulai', 'tanggalSelesai'],
      },
    );
  static readonly STATUS: ZodType = z.object({
    status: z.boolean(),
  });
}
