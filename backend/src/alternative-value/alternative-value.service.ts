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

    if (getReq.kriteriaCode) {
      filter.push({
        kriteriaCode: getReq.kriteriaCode,
      });
    }

    if (getReq.alternativeCode) {
      filter.push({
        alternativeCode: getReq.alternativeCode,
      });
    }

    const result = await this.prismaService.nilaiAlternatif.findMany({
      where: {
        AND: filter,
      },
      include: {
        kriteria: {
          select: {
            name: true,
          },
        },
        alternatif: {
          include: {
            pengguna: {
              select: {
                fullname: true,
              },
            },
          },
        },
      },
      skip: (getReq.page - 1) * getReq.limit,
      take: getReq.limit,
      orderBy: [
        {
          kriteriaCode: 'desc',
        },
        {
          createdAt: 'desc',
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
  async getDetail(alternativeCode: string): Promise<{
    alternativeCode: string;
    beasiswaCode: string;
    values: {
      kriteriaCode: string;
      kriteriaName: string;
      value: number;
    }[];
  }> {
    const alternative = await this.prismaService.alternatif.findUnique({
      where: {
        code: alternativeCode,
      },
      select: {
        code: true,
        beasiswaCode: true,
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
          alternativeCode,
        },
        include: {
          kriteria: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      }),

      this.prismaService.kriteria.findMany({
        where: {
          beasiswaCode: alternative.beasiswaCode,
        },
        select: {
          code: true,
          name: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
    ]);

    const values = criteria.map((item) => {
      const existing = res.find((nilai) => nilai.kriteriaCode === item.code);

      return {
        kriteriaCode: item.code,
        kriteriaName: item.name,
        value: existing?.value ?? 0,
      };
    });

    return {
      alternativeCode,
      beasiswaCode: alternative.beasiswaCode,
      values,
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
        code: req.alternativeCode,
      },
      include: {
        pengguna: {
          select: {
            fullname: true,
          },
        },
      },
    });

    if (!alternative) {
      throw new HttpException('Alternatif tidak ditemukan', 404);
    }

    const criteriaCodes = req.values.map((item) => item.kriteriaCode);

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
        alternativeCode: req.alternativeCode,
        kriteriaCode: {
          in: criteriaCodes,
        },
      },
      select: {
        kriteriaCode: true,
      },
    });

    if (existing.length > 0) {
      throw new HttpException(
        `Nilai alternatif untuk kriteria ${existing
          .map((x) => x.kriteriaCode)
          .join(', ')} sudah ada`,
        400,
      );
    }

    // create many
    await this.prismaService.nilaiAlternatif.createMany({
      data: req.values.map((item) => ({
        id: nanoid(),
        alternativeCode: req.alternativeCode,
        kriteriaCode: item.kriteriaCode,
        value: item.value,
      })),
    });

    // ambil hasil
    const rows = await this.prismaService.nilaiAlternatif.findMany({
      where: {
        alternativeCode: req.alternativeCode,
        kriteriaCode: {
          in: criteriaCodes,
        },
      },
      include: {
        kriteria: {
          select: {
            name: true,
          },
        },
        alternatif: {
          include: {
            pengguna: {
              select: {
                fullname: true,
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
        code: req.alternativeCode,
      },
    });

    if (!alternative) {
      throw new HttpException('Alternatif tidak ditemukan', 404);
    }

    const criteriaCodes = req.values.map((item) => item.kriteriaCode);

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
          alternativeCode: req.alternativeCode,
          NOT: {
            kriteriaCode: {
              in: criteriaCodes,
            },
          },
        },
      });

      // update/create
      for (const item of req.values) {
        await tx.nilaiAlternatif.upsert({
          where: {
            alternativeCode_kriteriaCode: {
              alternativeCode: req.alternativeCode,
              kriteriaCode: item.kriteriaCode,
            },
          },
          update: {
            value: item.value,
          },
          create: {
            alternativeCode: req.alternativeCode,
            kriteriaCode: item.kriteriaCode,
            value: item.value,
          },
        });
      }
    });

    // ambil hasil terbaru
    const rows = await this.prismaService.nilaiAlternatif.findMany({
      where: {
        alternativeCode: req.alternativeCode,
      },
      include: {
        kriteria: {
          select: {
            name: true,
          },
        },
        alternatif: {
          include: {
            pengguna: {
              select: {
                fullname: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
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
