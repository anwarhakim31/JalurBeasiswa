import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class MasterDataService {
  constructor(private prisma: PrismaService) {}

  async getMasterData() {
    let masterData = await this.prisma.masterData.findFirst();

    if (!masterData) {
      masterData = await this.prisma.masterData.create({
        data: {
          unggahBerkas: false,
          bukaPendaftaran: true,
          modePemeliharaan: false,
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
      create: { unggahBerkas: false },
      select: { unggahBerkas: true },
    });

    return result;
  }

  async toggleRegistration() {
    const masterData = await this.getMasterData();
    const result = await this.prisma.masterData.upsert({
      where: { id: masterData.id },
      update: { bukaPendaftaran: !masterData.bukaPendaftaran },
      create: { unggahBerkas: true },
      select: { bukaPendaftaran: true },
    });

    return result;
  }
  async toggleMaintenance() {
    const masterData = await this.getMasterData();
    const result = await this.prisma.masterData.upsert({
      where: { id: masterData.id },
      update: { modePemeliharaan: !masterData.modePemeliharaan },
      create: { modePemeliharaan: false },
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
}
