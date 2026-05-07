import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { nanoid } from 'nanoid/non-secure';
import { StatusHasil } from '@prisma/client';

@Injectable()
export class ProcessValuesService {
  constructor(private prismaService: PrismaService) {}

  async step(kodeBeasiswa: string, search?: string, page?: number) {
    const beasiswa = await this.prismaService.beasiswa.findUnique({
      where: {
        kode: kodeBeasiswa,
      },
    });

    if (!beasiswa) {
      throw new HttpException(
        'Beasiswa tidak ditemukan dengan kode tersebut',
        404,
      );
    }

    const kriteria = await this.prismaService.kriteria.findMany({
      where: {
        kodeBeasiswa,
      },
      orderBy: {
        kode: 'desc',
      },
    });

    if (!kriteria.length) {
      throw new HttpException(
        'Kriteria dengan kode beasiswa tersebut tidak ditemukan',
        404,
      );
    }

    const statsData = await this.prismaService.nilaiAlternatif.groupBy({
      by: ['kodeKriteria'],
      where: {
        alternatif: {
          kodeBeasiswa,
        },
      },
      _max: {
        nilai: true,
      },
      _min: {
        nilai: true,
      },
    });

    const stats = new Map<
      string,
      {
        kodeKriteria: string;
        namaKriteria: string;
        bobot: number;
        tipe: string;
        max: number;
        min: number;
      }
    >();

    for (const k of kriteria) {
      const stat = statsData.find((s) => s.kodeKriteria === k.kode);

      stats.set(k.kode, {
        kodeKriteria: k.kode,
        namaKriteria: k.nama,
        bobot: k.bobot,
        tipe: k.tipe,
        max: stat?._max.nilai ?? 0,
        min: stat?._min.nilai ?? 0,
      });
    }

    const filter = [];

    if (search) {
      filter.push({
        OR: [
          {
            kode: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            pengguna: {
              namaLengkap: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        ],
      });
    }

    const alternatives = await this.prismaService.alternatif.findMany({
      where: {
        AND: filter,
        kodeBeasiswa,
      },
      skip: (page - 1) * 100,
      take: 100,
      select: {
        kode: true,
        pengguna: {
          select: {
            namaLengkap: true,
          },
        },
        nilaiAlternatif: {
          select: {
            kodeKriteria: true,
            nilai: true,
          },
        },
      },
      orderBy: {
        kode: 'asc',
      },
    });

    const total = await this.prismaService.alternatif.count({
      where: {
        AND: filter,
        kodeBeasiswa,
      },
    });

    const step1Alternatives = alternatives.map((alt) => {
      const nilaiMap = new Map(
        alt.nilaiAlternatif.map((n) => [n.kodeKriteria, n.nilai]),
      );

      const nilaiByKriteria = kriteria.reduce(
        (acc, k) => {
          acc[k.nama] = nilaiMap.get(k.kode) ?? '-';
          return acc;
        },
        {} as Record<string, number | string>,
      );

      return {
        kode: alt.kode,
        nama: alt.pengguna.namaLengkap,
        ...nilaiByKriteria,
      };
    });

    const step2Alternatives = alternatives.map((alt) => {
      const nilaiMap = new Map(
        alt.nilaiAlternatif.map((n) => [n.kodeKriteria, n.nilai]),
      );

      const nilaiByKriteria = kriteria.reduce(
        (acc, k) => {
          acc[k.nama] =
            k.tipe === 'Keuntungan'
              ? `${nilaiMap.get(k.kode) ? `${new Intl.NumberFormat('id-ID').format(nilaiMap.get(k.kode))}/${new Intl.NumberFormat('id-ID').format(stats.get(k.kode)?.max)}` : '-'}  `
              : nilaiMap.get(k.kode)
                ? `${new Intl.NumberFormat('id-ID').format(stats.get(k.kode)?.min)}/${new Intl.NumberFormat('id-ID').format(nilaiMap.get(k.kode))}`
                : '-';
          return acc;
        },
        {} as Record<string, number | string>,
      );

      return {
        kode: alt.kode,
        nama: alt.pengguna.namaLengkap,
        ...nilaiByKriteria,
      };
    });

    const step3Alternatives = alternatives.map((alt) => {
      const nilaiMap = new Map(
        alt.nilaiAlternatif.map((n) => [n.kodeKriteria, n.nilai]),
      );

      const nilaiByKriteria = kriteria.reduce(
        (acc, k) => {
          acc[k.nama] =
            k.tipe === 'Keuntungan'
              ? nilaiMap.get(k.kode)
                ? Number(
                    (nilaiMap.get(k.kode) / stats.get(k.kode)?.max).toFixed(3),
                  )
                : 0
              : nilaiMap.get(k.kode)
                ? Number(
                    (stats.get(k.kode)?.min / nilaiMap.get(k.kode)).toFixed(3),
                  )
                : 0;
          return acc;
        },
        {} as Record<string, number | string>,
      );

      return {
        kode: alt.kode,
        nama: alt.pengguna.namaLengkap,
        ...nilaiByKriteria,
      };
    });

    const step4Alternatives = alternatives.map((alt) => {
      const nilaiMap = new Map(
        alt.nilaiAlternatif.map((n) => [n.kodeKriteria, n.nilai]),
      );

      const nilaiByKriteria = kriteria.reduce(
        (acc, k) => {
          acc[k.nama] =
            k.tipe === 'Keuntungan'
              ? nilaiMap.get(k.kode)
                ? `${Number(
                    (nilaiMap.get(k.kode) / stats.get(k.kode)?.max).toFixed(3),
                  )} x ${k.bobot}`
                : '-'
              : nilaiMap.get(k.kode)
                ? `${Number(
                    (stats.get(k.kode)?.min / nilaiMap.get(k.kode)).toFixed(3),
                  )} x ${k.bobot}`
                : '-';
          return acc;
        },
        {} as Record<string, number | string>,
      );

      return {
        kode: alt.kode,
        nama: alt.pengguna.namaLengkap,
        ...nilaiByKriteria,
      };
    });

    const step5Alternatives = alternatives.map((alt) => {
      const nilaiMap = new Map(
        alt.nilaiAlternatif.map((n) => [n.kodeKriteria, n.nilai]),
      );

      const nilaiByKriteria = kriteria.reduce(
        (acc, k) => {
          acc[k.nama] =
            k.tipe === 'Keuntungan'
              ? nilaiMap.get(k.kode)
                ? Number(
                    (
                      (nilaiMap.get(k.kode) / stats.get(k.kode)?.max) *
                      k.bobot
                    ).toFixed(3),
                  )
                : 0
              : nilaiMap.get(k.kode)
                ? Number(
                    (
                      (stats.get(k.kode)?.min / nilaiMap.get(k.kode)) *
                      k.bobot
                    ).toFixed(3),
                  )
                : 0;
          return acc;
        },
        {} as Record<string, number | string>,
      );

      return {
        kode: alt.kode,
        nama: alt.pengguna.namaLengkap,
        ...nilaiByKriteria,
      };
    });

    const step6Alternatives = alternatives.map((alt) => {
      const nilaiMap = new Map(
        alt.nilaiAlternatif.map((n) => [n.kodeKriteria, n.nilai]),
      );

      const nilaiByKriteria = kriteria.reduce(
        (acc, k) => {
          const nilai =
            k.tipe === 'Keuntungan'
              ? nilaiMap.get(k.kode)
                ? Number(
                    (
                      (nilaiMap.get(k.kode) / stats.get(k.kode)?.max) *
                      k.bobot
                    ).toFixed(3),
                  )
                : 0
              : nilaiMap.get(k.kode)
                ? Number(
                    (
                      (stats.get(k.kode)?.min / nilaiMap.get(k.kode)) *
                      k.bobot
                    ).toFixed(3),
                  )
                : 0;

          acc[k.nama] = nilai;
          acc.hasil += nilai;

          return acc;
        },
        {
          hasil: 0,
        } as Record<string, number>,
      );

      return {
        kode: alt.kode,
        nama: alt.pengguna.namaLengkap,
        ...nilaiByKriteria,
        hasil: Number(nilaiByKriteria.hasil.toFixed(3)),
      };
    });

    return {
      beasiswa: {
        kode: beasiswa.kode,
        nama: beasiswa.nama,
        periode: beasiswa.periode,
      },

      step1: {
        alternatif: step1Alternatives,
        kriteria: [
          {
            filter: 'Nilai Max',
            ...[...stats.values()].reduce(
              (acc, s) => ({
                ...acc,
                [s.namaKriteria]: s.max,
              }),
              {},
            ),
          },
          {
            filter: 'Nilai Min',
            ...[...stats.values()].reduce(
              (acc, s) => ({
                ...acc,
                [s.namaKriteria]: s.min,
              }),
              {},
            ),
          },
          {
            filter: 'Nilai Acuan',
            ...[...stats.values()].reduce(
              (acc, s) => ({
                ...acc,
                [s.namaKriteria]: s.tipe === 'Keuntungan' ? s.max : s.min,
              }),
              {},
            ),
          },
        ],
      },
      step2: {
        alternatif: step2Alternatives,
        kriteria: [
          {
            filter: 'Nilai Acuan',
            ...[...stats.values()].reduce(
              (acc, s) => ({
                ...acc,
                [s.namaKriteria]: s.tipe === 'Keuntungan' ? s.max : s.min,
              }),
              {},
            ),
          },
        ],
      },
      step3: {
        alternatif: step3Alternatives,
      },
      step4: {
        alternatif: step4Alternatives,
        kriteria: [
          {
            filter: 'Bobot Kriteria',
            ...[...stats.values()].reduce(
              (acc, k) => ({
                ...acc,
                [k.namaKriteria]: k.bobot,
              }),
              {} as Record<string, number>,
            ),
          },
        ],
      },
      step5: {
        alternatif: step5Alternatives,
      },
      step6: {
        alternatif: step6Alternatives,
      },
      pagging: {
        total: total || 0,
        page: page || 1,
        limit: 100,
        totalPage: Math.ceil(total / 100),
      },
    };
  }

  async ranking(kodeBeasiswa: string, search?: string, page?: number) {
    const beasiswa = await this.prismaService.beasiswa.findUnique({
      where: {
        kode: kodeBeasiswa,
      },
    });

    if (!beasiswa) {
      throw new HttpException(
        'Beasiswa tidak ditemukan dengan kode tersebut',
        404,
      );
    }

    const kriteria = await this.prismaService.kriteria.findMany({
      where: {
        kodeBeasiswa,
      },
      orderBy: {
        kode: 'desc',
      },
    });

    if (!kriteria.length) {
      throw new HttpException(
        'Kriteria dengan kode beasiswa tersebut tidak ditemukan',
        404,
      );
    }

    const statsData = await this.prismaService.nilaiAlternatif.groupBy({
      by: ['kodeKriteria'],
      where: {
        alternatif: {
          kodeBeasiswa,
        },
      },
      _max: {
        nilai: true,
      },
      _min: {
        nilai: true,
      },
    });

    const stats = new Map<
      string,
      {
        kodeKriteria: string;
        namaKriteria: string;
        bobot: number;
        tipe: string;
        max: number;
        min: number;
      }
    >();

    for (const k of kriteria) {
      const stat = statsData.find((s) => s.kodeKriteria === k.kode);

      stats.set(k.kode, {
        kodeKriteria: k.kode,
        namaKriteria: k.nama,
        bobot: k.bobot,
        tipe: k.tipe,
        max: stat?._max.nilai ?? 0,
        min: stat?._min.nilai ?? 0,
      });
    }

    const alternatives = await this.prismaService.alternatif.findMany({
      select: {
        kode: true,
        pengguna: {
          select: {
            namaLengkap: true,
          },
        },
        nilaiAlternatif: {
          select: {
            kodeKriteria: true,
            nilai: true,
          },
        },
      },
      orderBy: {
        kode: 'asc',
      },
    });

    const alternativesWithNilai = alternatives.map((alt) => {
      const nilaiMap = new Map(
        alt.nilaiAlternatif.map((n) => [n.kodeKriteria, n.nilai]),
      );

      const nilaiByKriteria = kriteria.reduce(
        (acc, k) => {
          const nilai =
            k.tipe === 'Keuntungan'
              ? nilaiMap.get(k.kode)
                ? Number(
                    (
                      (nilaiMap.get(k.kode) / stats.get(k.kode)?.max) *
                      k.bobot
                    ).toFixed(3),
                  )
                : 0
              : nilaiMap.get(k.kode)
                ? Number(
                    (
                      (stats.get(k.kode)?.min / nilaiMap.get(k.kode)) *
                      k.bobot
                    ).toFixed(3),
                  )
                : 0;

          acc[k.nama] = nilai;
          acc.hasil += nilai;
          return acc;
        },
        {
          hasil: 0,
        } as Record<string, number>,
      );

      return {
        kode: alt.kode,
        nama: alt.pengguna.namaLengkap,
        hasil: Number(nilaiByKriteria.hasil.toFixed(3)),
      };
    });

    const ranked = [...alternativesWithNilai]
      .sort((a, b) => b.hasil - a.hasil)
      .map((item, index) => ({
        ...item,
        peringkat: index + 1,
      }));

    await this.prismaService.$transaction(
      ranked.map((alt) =>
        this.prismaService.hasil.upsert({
          where: {
            kodeAlternatif_kodeBeasiswa: {
              kodeBeasiswa,
              kodeAlternatif: alt.kode,
            },
          },
          create: {
            id: nanoid(),
            kodeBeasiswa,
            kodeAlternatif: alt.kode,
            nilai: alt.hasil,
            peringkat: alt.peringkat,
          },
          update: {
            nilai: alt.hasil,
            peringkat: alt.peringkat,
          },
        }),
      ),
    );
    const filter = [];

    if (search) {
      filter.push({
        OR: [
          {
            alternatif: {
              kode: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
          {
            alternatif: {
              pengguna: {
                namaLengkap: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          },
        ],
      });
    }

    const alternatif = await this.prismaService.hasil.findMany({
      where: {
        AND: filter,
        kodeBeasiswa,
      },
      skip: (page - 1) * 100,
      take: 100,
      orderBy: {
        peringkat: 'asc',
      },
      include: {
        alternatif: {
          select: {
            kode: true,
            pengguna: {
              select: {
                namaLengkap: true,
              },
            },
          },
        },
      },
    });

    const total = await this.prismaService.hasil.count({
      where: {
        AND: filter,
        kodeBeasiswa,
      },
    });

    return {
      beasiswa: {
        kode: beasiswa.kode,
        nama: beasiswa.nama,
        periode: beasiswa.periode,
        publikasi: beasiswa.publikasi,
      },
      ranking: alternatif.map((x) => ({
        id: x.id,
        kode: x.alternatif.kode,
        namaLengkap: x.alternatif.pengguna.namaLengkap,
        nilai: x.nilai,
        peringkat: x.peringkat,
        status: x.status,
      })),
      pagging: {
        total: total || 0,
        page: page || 1,
        limit: 100,
        totalPage: Math.ceil(total / 100),
      },
    };
  }

  async changeStatus(request: {
    selected: string[];
    status: 'Disetujui' | 'Ditolak' | 'Diproses';
  }) {
    const statusMap: Record<string, StatusHasil> = {
      Disetujui: StatusHasil.Disetujui,
      Diproses: StatusHasil.Diproses,
      Ditolak: StatusHasil.Ditolak,
    };

    if (!statusMap[request.status]) {
      throw new HttpException('Status tidak valid', 404);
    }

    const NilaiHaslKeputusan = await this.prismaService.hasil.findMany({
      where: {
        id: {
          in: request.selected,
        },
      },
    });

    if (
      NilaiHaslKeputusan.length == 0 ||
      NilaiHaslKeputusan.length < request.selected.length
    ) {
      throw new HttpException('Nilai Hasil Keputusan tidak ditemukan', 404);
    }

    const updateHasil = await this.prismaService.hasil.updateMany({
      where: {
        id: {
          in: request.selected,
        },
      },
      data: {
        status: statusMap[request.status],
      },
    });
    if (updateHasil.count == 0 || updateHasil.count < request.selected.length) {
      throw new HttpException('Nilai Hasil Keputusan tidak ditemukan', 404);
    }

    return updateHasil;
  }
}
