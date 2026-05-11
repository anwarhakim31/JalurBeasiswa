import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';

import { AlternativeValueValidation } from './alternative-value.validation';
import { Paging } from '../models/web.model';
import { nanoid } from 'nanoid';

import {
  AlternativeValueResponse,
  ReqDeleteAlternativeValue,
  ReqGetAllAlternativeValue,
  ReqPostAlternativeValue,
  ReqPutAlternativeValue,
} from '../models/alternative-value.model';

@Injectable()
export class AlternativeValueService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async GetAll(
    request: ReqGetAllAlternativeValue,
  ): Promise<{ data: AlternativeValueResponse[]; paging?: Paging }> {
    const getReq: ReqGetAllAlternativeValue = this.validationService.validate(
      AlternativeValueValidation.GETALL,
      request,
    ) as ReqGetAllAlternativeValue;

    const filter = [];

    if (getReq.kodeKriteria) {
      filter.push({
        kodeKriteria: getReq.kodeKriteria,
      });
    }

    if (getReq.kodeAlternatif) {
      filter.push({
        kodeAlternatif: getReq.kodeAlternatif,
      });
    }

    const result = await this.prismaService.nilaiAlternatif.findMany({
      where: {
        AND: filter,
      },
      include: {
        kriteria: {
          select: {
            nama: true,
          },
        },
        alternatif: {
          include: {
            pengguna: {
              select: {
                namaLengkap: true,
              },
            },
          },
        },
      },
      skip: (getReq.page - 1) * getReq.limit,
      take: getReq.limit,
      orderBy: [
        {
          kodeAlternatif: 'desc',
        },
        {
          kodeKriteria: 'desc',
        },
      ],
    });

    const total = await this.prismaService.nilaiAlternatif.count({
      where: {
        AND: filter,
      },
    });

    return {
      data: result,
      paging: {
        limit: getReq.limit,
        totalPage: Math.ceil(total / getReq.limit),
        page: getReq.page,
        total: total,
      },
    };
  }
  async getDetail(kodeAlternatif: string): Promise<{
    kodeAlternatif: string;
    kodeBeasiswa: string;
    nilaiAlternatif: {
      kodeKriteria: string;
      namaKriteria: string;
      nilai: number;
    }[];
  }> {
    const alternative = await this.prismaService.alternatif.findUnique({
      where: {
        kode: kodeAlternatif,
      },
      select: {
        kode: true,
        kodeBeasiswa: true,
      },
    });

    if (!alternative) {
      throw new HttpException(
        'Alternatif dengan kode tersebut tidak ditemukan',
        404,
      );
    }

    const [res, criteria] = await Promise.all([
      this.prismaService.nilaiAlternatif.findMany({
        where: {
          kodeAlternatif,
        },
        include: {
          kriteria: {
            select: {
              kode: true,
              nama: true,
            },
          },
        },
      }),

      this.prismaService.kriteria.findMany({
        where: {
          kodeBeasiswa: alternative.kodeBeasiswa,
        },
        select: {
          kode: true,
          nama: true,
        },
        orderBy: {
          dibuatPada: 'asc',
        },
      }),
    ]);

    const nilaiAlternatif = criteria.map((item) => {
      const existing = res.find((nilai) => nilai.kodeKriteria === item.kode);

      return {
        kodeKriteria: item.kode,
        namaKriteria: item.nama,
        nilai: existing?.nilai ?? 0,
      };
    });

    return {
      kodeAlternatif,
      kodeBeasiswa: alternative.kodeBeasiswa,
      nilaiAlternatif,
    };
  }
  async create(
    request: ReqPostAlternativeValue,
  ): Promise<AlternativeValueResponse[]> {
    const req = this.validationService.validate(
      AlternativeValueValidation.CREATE,
      request,
    ) as ReqPostAlternativeValue;

    // cek alternatif ada
    const alternative = await this.prismaService.alternatif.findUnique({
      where: {
        kode: req.kodeAlternatif,
      },
      include: {
        pengguna: {
          select: {
            namaLengkap: true,
          },
        },
      },
    });

    if (!alternative) {
      throw new HttpException('Alternatif tidak ditemukan', 404);
    }

    const criteriaCodes = req.nilaiAlternatif.map((item) => item.kodeKriteria);

    // cek duplicate dalam payload
    const uniqueCodes = new Set(criteriaCodes);
    if (uniqueCodes.size !== criteriaCodes.length) {
      throw new HttpException(
        'Kriteria tidak boleh duplikat dalam request',
        400,
      );
    }

    // cek apakah sudah pernah input
    const existing = await this.prismaService.nilaiAlternatif.findMany({
      where: {
        kodeAlternatif: req.kodeAlternatif,
        kodeKriteria: {
          in: criteriaCodes,
        },
      },
      select: {
        kodeKriteria: true,
      },
    });

    if (existing.length > 0) {
      throw new HttpException(
        `Nilai alternatif untuk kriteria ${existing
          .map((x) => x.kodeKriteria)
          .join(', ')} sudah ada`,
        400,
      );
    }

    // create many
    await this.prismaService.nilaiAlternatif.createMany({
      data: req.nilaiAlternatif.map((item) => ({
        id: nanoid(),
        kodeAlternatif: req.kodeAlternatif,
        kodeKriteria: item.kodeKriteria,
        nilai: item.nilai,
      })),
    });

    const statsData = await this.prismaService.nilaiAlternatif.groupBy({
      by: ['kodeKriteria'],
      where: {
        alternatif: {
          kodeBeasiswa: alternative.kodeBeasiswa,
        },
      },
      _max: {
        nilai: true,
      },
      _min: {
        nilai: true,
      },
    });

    const kriteria = await this.prismaService.kriteria.findMany({
      where: {
        kodeBeasiswa: alternative.kodeBeasiswa,
      },
      select: {
        kode: true,
        nama: true,
        bobot: true,
        tipe: true,
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
              kodeBeasiswa: alternative.kodeBeasiswa,
              kodeAlternatif: alt.kode,
            },
          },
          create: {
            id: nanoid(),
            kodeBeasiswa: alternative.kodeBeasiswa,
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

    // ambil hasil
    const rows = await this.prismaService.nilaiAlternatif.findMany({
      where: {
        kodeAlternatif: req.kodeAlternatif,
        kodeKriteria: {
          in: criteriaCodes,
        },
      },
      include: {
        kriteria: {
          select: {
            nama: true,
          },
        },
        alternatif: {
          include: {
            pengguna: {
              select: {
                namaLengkap: true,
              },
            },
          },
        },
      },
    });

    return rows;
  }
  async update(
    request: ReqPutAlternativeValue,
  ): Promise<AlternativeValueResponse[]> {
    const req = this.validationService.validate(
      AlternativeValueValidation.PUT,
      request,
    ) as ReqPutAlternativeValue;

    // cek alternatif
    const alternative = await this.prismaService.alternatif.findUnique({
      where: {
        kode: req.kodeAlternatif,
      },
    });

    if (!alternative) {
      throw new HttpException('Alternatif tidak ditemukan', 404);
    }

    const criteriaCodes = req.nilaiAlternatif.map((item) => item.kodeKriteria);

    // duplicate payload
    if (new Set(criteriaCodes).size !== criteriaCodes.length) {
      throw new HttpException(
        'Kriteria tidak boleh duplikat dalam request',
        400,
      );
    }

    await this.prismaService.$transaction(async (tx) => {
      // hapus nilai yang tidak dikirim lagi
      await tx.nilaiAlternatif.deleteMany({
        where: {
          kodeAlternatif: req.kodeAlternatif,
          NOT: {
            kodeKriteria: {
              in: criteriaCodes,
            },
          },
        },
      });

      // update/create
      for (const item of req.nilaiAlternatif) {
        await tx.nilaiAlternatif.upsert({
          where: {
            kodeAlternatif_kodeKriteria: {
              kodeAlternatif: req.kodeAlternatif,
              kodeKriteria: item.kodeKriteria,
            },
          },
          update: {
            nilai: item.nilai,
          },
          create: {
            kodeAlternatif: req.kodeAlternatif,
            kodeKriteria: item.kodeKriteria,
            nilai: item.nilai,
          },
        });
      }
    });

    const statsData = await this.prismaService.nilaiAlternatif.groupBy({
      by: ['kodeKriteria'],
      where: {
        alternatif: {
          kodeBeasiswa: alternative.kodeBeasiswa,
        },
      },
      _max: {
        nilai: true,
      },
      _min: {
        nilai: true,
      },
    });

    const kriteria = await this.prismaService.kriteria.findMany({
      where: {
        kodeBeasiswa: alternative.kodeBeasiswa,
      },
      select: {
        kode: true,
        nama: true,
        bobot: true,
        tipe: true,
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
              kodeBeasiswa: alternative.kodeBeasiswa,
              kodeAlternatif: alt.kode,
            },
          },
          create: {
            id: nanoid(),
            kodeBeasiswa: alternative.kodeBeasiswa,
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

    // ambil hasil terbaru
    const rows = await this.prismaService.nilaiAlternatif.findMany({
      where: {
        kodeAlternatif: req.kodeAlternatif,
      },
      include: {
        kriteria: {
          select: {
            nama: true,
          },
        },
        alternatif: {
          include: {
            pengguna: {
              select: {
                namaLengkap: true,
              },
            },
          },
        },
      },
      orderBy: {
        dibuatPada: 'asc',
      },
    });

    return rows;
  }

  async delete(request: ReqDeleteAlternativeValue) {
    const alternatif = await this.prismaService.nilaiAlternatif.findMany({
      where: {
        id: {
          in: request.selected,
        },
      },
    });

    if (alternatif.length == 0 || alternatif.length < request.selected.length) {
      throw new HttpException('Nilai Alternatif tidak ditemukan', 404);
    }

    const deleteAlternatif =
      await this.prismaService.nilaiAlternatif.deleteMany({
        where: {
          id: {
            in: request.selected,
          },
        },
      });

    if (
      deleteAlternatif.count == 0 ||
      deleteAlternatif.count < request.selected.length
    ) {
      throw new HttpException('Nilai Alternatif tidak ditemukan', 404);
    }

    return deleteAlternatif;
  }
}
