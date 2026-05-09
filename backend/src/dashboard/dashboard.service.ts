import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prismaService: PrismaService) {}

  async dashboard() {
    // =================================== Summery Data ===========================================
    const totalPengguna = await this.prismaService.pengguna.count({
      where: {
        admin: false,
      },
    });

    const totalPenggunaDiterima = await this.prismaService.pengguna.count({
      where: {
        admin: false,
        status: 'Diterima',
      },
    });

    const totalBeasiswa = await this.prismaService.beasiswa.count();

    const totalBeasiswaAktif = await this.prismaService.beasiswa.count({
      where: {
        status: true,
      },
    });

    const totalBeasiswaNonaktif = await this.prismaService.beasiswa.count({
      where: {
        status: false,
      },
    });

    const totalKriteria = await this.prismaService.kriteria.count();

    const totalKriteriaKeuntungan = await this.prismaService.kriteria.count({
      where: {
        tipe: 'Keuntungan',
      },
    });

    const totalKriteriaBiaya = await this.prismaService.kriteria.count({
      where: {
        tipe: 'Biaya',
      },
    });

    const totalAlternatif = await this.prismaService.alternatif.count();

    const alternatifBelumDinilai = await this.prismaService.alternatif.count({
      where: {
        nilaiAlternatif: {
          none: {},
        },
      },
    });
    //  ========================= decision ============================
    const TotalHasilKeputusan = await this.prismaService.hasil.count();

    const TotalHasilKeputusanDisetujui = await this.prismaService.hasil.count({
      where: {
        status: 'Disetujui',
      },
    });

    const TotalHasilKeputusanDitolak = await this.prismaService.hasil.count({
      where: {
        status: 'Ditolak',
      },
    });

    const TotalHasilKeputusanDiproses = await this.prismaService.hasil.count({
      where: {
        status: 'Diproses',
      },
    });

    // ================================ alternative perbeasiswa ===========================

    const beasiswaPerbeasiswa = await this.prismaService.alternatif.groupBy({
      by: ['kodeBeasiswa'],
      _count: {
        kode: true,
      },
      orderBy: {
        _count: {
          kode: 'desc',
        },
      },
      take: 5,
    });

    const beasiswaBelumDinilaiPerbeasiswa =
      await this.prismaService.alternatif.groupBy({
        by: ['kodeBeasiswa'],
        _count: {
          kode: true,
        },
        where: {
          nilaiAlternatif: {
            none: {},
          },
        },
        orderBy: {
          _count: {
            kode: 'desc',
          },
        },
        take: 5,
      });

    // ===================================== Highest Value =====================================

    const highestValue = await this.prismaService.hasil.findMany({
      where: {
        status: 'Disetujui',
      },
      orderBy: {
        nilai: 'desc',
      },
      take: 3,
      include: {
        alternatif: {
          include: {
            pengguna: {
              select: {
                namaLengkap: true,
                foto: true,
              },
            },
          },
        },
      },
    });

    // ===================================== Top Beasiswa =====================================

    const topBeasiswa = await this.prismaService.hasil.findMany({
      orderBy: [
        {
          kodeBeasiswa: 'asc',
        },
        {
          nilai: 'desc',
        },
      ],
      distinct: ['kodeBeasiswa'],
    });

    return {
      metrics: [
        {
          name: 'Pengguna',
          total: totalPengguna,
          detail: {
            diterima: totalPenggunaDiterima,
          },
        },
        {
          name: 'Beasiswa',
          total: totalBeasiswa,
          detail: {
            aktif: totalBeasiswaAktif,
            nonaktif: totalBeasiswaNonaktif,
          },
        },
        {
          name: 'Kriteria',
          total: totalKriteria,
          detail: {
            keuntungan: totalKriteriaKeuntungan,
            biaya: totalKriteriaBiaya,
          },
        },
        {
          name: 'Alternatif',
          total: totalAlternatif,
          detail: {
            belumDinilai: alternatifBelumDinilai,
          },
        },
      ],
      decision: {
        total: TotalHasilKeputusan,
        results: [
          {
            status: 'Disetujui',
            hasil: TotalHasilKeputusanDisetujui || 0,
          },
          {
            status: 'Ditolak',
            hasil: TotalHasilKeputusanDitolak || 0,
          },
          {
            status: 'Diproses',
            hasil: TotalHasilKeputusanDiproses || 0,
          },
        ],
      },
      beasiswa: {
        total: totalBeasiswa,
        alternative: beasiswaPerbeasiswa.map((beasiswa) => {
          const beasiswaBelumDinilai = beasiswaBelumDinilaiPerbeasiswa.find(
            (b) => b.kodeBeasiswa === beasiswa.kodeBeasiswa,
          );

          return {
            beasiswa: beasiswa.kodeBeasiswa,
            total: beasiswa._count.kode,
            belumDinilai: beasiswaBelumDinilai
              ? beasiswaBelumDinilai._count.kode
              : 0,
            dinilai: beasiswa._count.kode - beasiswaBelumDinilai._count.kode,
          };
        }),
      },
      highestValue,
      topBeasiswa: topBeasiswa.map((beasiswa) => ({
        beasiswa: beasiswa.kodeBeasiswa,
        nilai: beasiswa.nilai,
      })),
    };
  }
}
