import { z, ZodType } from 'zod';

export class MasterDataValidation {
  static readonly EditBasicInformation: ZodType = z.object({
    namaWebsite: z
      .string()
      .nonempty('Nama website tidak boleh kosong')
      .min(3, 'Minimal 3 karakter')
      .max(125, 'Maksimal 125 karakter'),
    tagline: z
      .string()
      .nonempty('Tagline tidak boleh kosong')
      .min(3, 'Minimal 3 karakter')
      .max(125, 'Maksimal 125 karakter'),
    deskripsi: z
      .string()
      .nonempty('Deskripsi tidak boleh kosong')
      .min(3, 'Minimal 3 karakter')
      .max(512, 'Maksimal 512 karakter'),
  });

  static readonly EditContactService: ZodType = z
    .object({
      telpon: z.string().optional(),
      email: z.string().optional(),
      instagram: z.string().optional(),
      websiteUtama: z.string().optional(),
    })
    .refine(
      (val) => {
        if (val.email && !val.email.includes('@')) return false;
        return true;
      },
      {
        message: 'Email tidak valid',
        path: ['email'],
      },
    )
    .refine(
      (val) => {
        if (val.websiteUtama && !val.websiteUtama.startsWith('https://'))
          return false;
        return true;
      },
      {
        message: 'Website utama harus dimulai dengan https://',
        path: ['websiteUtama'],
      },
    )
    .refine(
      (val) => {
        const regexNumber = /^\d+$/.test(val.telpon);

        if (val.telpon && !regexNumber) return false;
        return true;
      },
      {
        message: 'Nomor telepon harus mengandung angka',
        path: ['telpon'],
      },
    );
}
