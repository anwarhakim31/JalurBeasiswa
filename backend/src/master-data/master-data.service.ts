import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import {
  ReqBasicInformation,
  ReqcontactService,
} from '../models/master-data.model';
import { MasterDataValidation } from './master-data.validation';

@Injectable()
export class MasterDataService {
  constructor(
    private prisma: PrismaService,
    private validationService: ValidationService,
  ) {}

  async getMasterData() {
    let masterData = await this.prisma.masterData.findFirst();

    if (!masterData) {
      masterData = await this.prisma.masterData.create({
        data: {
          unggahBerkas: false,
          bukaPendaftaran: true,
          modePemeliharaan: false,
          namaWebsite: 'Jalur Beasiswa',
          tagline: 'Sistem Pendukung Keputusan Penerimaan Beasiswa',
          deskripsi:
            'Sistem pendukung keputusan untuk membantu proses seleksi dan penerimaan beasiswa menggunakan metode SAW (Simple Additive Weighting)',
        },
      });
    }

    return masterData;
  }

  async toggleUploadDocument() {
    const masterData = await this.getMasterData();

    const result = await this.prisma.masterData.upsert({
      where: { id: masterData.id },
      update: { unggahBerkas: !masterData.unggahBerkas },
      create: {
        unggahBerkas: true,
        bukaPendaftaran: true,
        modePemeliharaan: false,
        namaWebsite: 'Jalur Beasiswa',
        tagline: 'Sistem Pendukung Keputusan Penerimaan Beasiswa',
        deskripsi:
          'Sistem pendukung keputusan untuk membantu proses seleksi dan penerimaan beasiswa menggunakan metode SAW (Simple Additive Weighting)',
      },
      select: { unggahBerkas: true },
    });

    return result;
  }

  async toggleRegistration() {
    const masterData = await this.getMasterData();
    const result = await this.prisma.masterData.upsert({
      where: { id: masterData.id },
      update: { bukaPendaftaran: !masterData.bukaPendaftaran },
      create: {
        unggahBerkas: true,
        bukaPendaftaran: true,
        modePemeliharaan: false,
        namaWebsite: 'Jalur Beasiswa',
        tagline: 'Sistem Pendukung Keputusan Penerimaan Beasiswa',
        deskripsi:
          'Sistem pendukung keputusan untuk membantu proses seleksi dan penerimaan beasiswa menggunakan metode SAW (Simple Additive Weighting)',
      },
      select: { bukaPendaftaran: true },
    });

    return result;
  }
  async toggleMaintenance() {
    const masterData = await this.getMasterData();
    const result = await this.prisma.masterData.upsert({
      where: { id: masterData.id },
      update: { modePemeliharaan: !masterData.modePemeliharaan },
      create: {
        unggahBerkas: false,
        bukaPendaftaran: true,
        modePemeliharaan: false,
        namaWebsite: 'Jalur Beasiswa',
        tagline: 'Sistem Pendukung Keputusan Penerimaan Beasiswa',
        deskripsi:
          'Sistem pendukung keputusan untuk membantu proses seleksi dan penerimaan beasiswa menggunakan metode SAW (Simple Additive Weighting)',
      },
      select: { modePemeliharaan: true },
    });
    return result;
  }

  async ResetAllData() {
    await this.prisma.pengguna.deleteMany();
    await this.prisma.beasiswa.deleteMany();
    await this.prisma.alternatif.deleteMany();
    await this.prisma.kriteria.deleteMany();
    await this.prisma.nilaiAlternatif.deleteMany();

    return true;
  }

  async ResetUserData() {
    await this.prisma.pengguna.deleteMany();
    return true;
  }

  async ResetBeasiswaData() {
    await this.prisma.beasiswa.deleteMany();
    return true;
  }
  async ResetAlternatifDAta() {
    await this.prisma.alternatif.deleteMany();
    return true;
  }
  async ResetCriteriaData() {
    await this.prisma.kriteria.deleteMany();
    return true;
  }
  async ResetNilaiData() {
    await this.prisma.nilaiAlternatif.deleteMany();
    return true;
  }

  async MainLogo(request: { logoUtama: string }) {
    const masterData = await this.getMasterData();

    if (!request.logoUtama) {
      throw new HttpException(
        { message: 'Logo utama harus diisi', field: ['logoUtama'] },
        400,
      );
    }

    const result = await this.prisma.masterData.update({
      where: { id: masterData.id },
      data: { logoUtama: request.logoUtama },
    });

    return result;
  }

  async SecondaryLogo(request: { logoKedua: string }) {
    const masterData = await this.getMasterData();

    if (!request.logoKedua) {
      throw new HttpException(
        { message: 'Logo kedua harus diisi', field: ['logo'] },
        400,
      );
    }

    const result = await this.prisma.masterData.update({
      where: { id: masterData.id },
      data: { logoKedua: request.logoKedua },
    });

    return result;
  }

  async Favicon(request: { favicon: string }) {
    const masterData = await this.getMasterData();

    if (!request.favicon) {
      throw new HttpException(
        { message: 'Favicon harus diisi', field: ['favicon'] },
        400,
      );
    }

    const result = await this.prisma.masterData.update({
      where: { id: masterData.id },
      data: { favicon: request.favicon },
    });

    return result;
  }

  async DeleteMainLogo() {
    const masterData = await this.getMasterData();

    if (!masterData.logoUtama) {
      throw new HttpException('Logo utama tidak ditemukan', 400);
    }

    const result = await this.prisma.masterData.update({
      where: { id: masterData.id },
      data: { logoUtama: null },
    });

    return result;
  }

  async DeleteSecondaryLogo() {
    const masterData = await this.getMasterData();

    if (!masterData.logoKedua) {
      throw new HttpException('Logo  tidak ditemukan', 400);
    }

    const result = await this.prisma.masterData.update({
      where: { id: masterData.id },
      data: { logoKedua: null },
    });

    return result;
  }

  async DeleteFavicon() {
    const masterData = await this.getMasterData();

    if (!masterData.favicon) {
      throw new HttpException('Favicon tidak ditemukan', 400);
    }

    const result = await this.prisma.masterData.update({
      where: { id: masterData.id },
      data: { favicon: null },
    });

    return result;
  }

  async BasicInformation(request: {
    namaWebsite: string;
    tagline: string;
    deskripsi: string;
  }) {
    const req: ReqBasicInformation = this.validationService.validate(
      MasterDataValidation.EditBasicInformation,
      request,
    ) as ReqBasicInformation;

    const masterData = await this.getMasterData();

    if (!masterData.namaWebsite) {
      throw new HttpException('Nama website tidak ditemukan', 400);
    }

    if (!masterData.tagline) {
      throw new HttpException('Tagline tidak ditemukan', 400);
    }

    if (!masterData.deskripsi) {
      throw new HttpException('Deskripsi tidak ditemukan', 400);
    }

    const result = await this.prisma.masterData.update({
      where: { id: masterData.id },
      data: {
        namaWebsite: req.namaWebsite,
        tagline: req.tagline,
        deskripsi: req.deskripsi,
      },
    });

    return result;
  }

  async ContactService(request: {
    telpon: string;
    email: string;
    instagram: string;
    websiteUtama: string;
  }) {
    const req: ReqcontactService = this.validationService.validate(
      MasterDataValidation.EditContactService,
      request,
    ) as ReqcontactService;

    const masterData = await this.getMasterData();

    const result = await this.prisma.masterData.update({
      where: { id: masterData.id },
      data: {
        telpon: req.telpon,
        email: req.email,
        instagram: req.instagram,
        websiteUtama: req.websiteUtama,
      },
    });

    return result;
  }
}
