import { HttpException, Injectable } from '@nestjs/common';

import { Paging } from '../models/web.model';
import { ValidationService } from '../common/validation.service';
import { PrismaService } from '../common/prisma.service';
import { CrteriaValidation } from './criteria.validation';
import { TipeKriteria } from '@prisma/client';
import {
  CriteriaResponse,
  ReqDeleteCriteria,
  ReqGetAllCriteria,
  ReqPostCriteria,
  ReqPutCriteria,
} from '../models/criteria.model';

@Injectable()
export class CriteriaService {
  constructor(
    private validationService: ValidationService,
    private prismaService: PrismaService,
  ) {}
  async getAll(
    request: ReqGetAllCriteria,
  ): Promise<{ data: CriteriaResponse[]; paging?: Paging }> {
    const getReq: ReqGetAllCriteria = this.validationService.validate(
      CrteriaValidation.GETALL,
      request,
    );

    const filter = [];

    if (getReq.search) {
      filter.push({
        OR: [
          {
            kode: {
              contains: getReq.search,
              mode: 'insensitive',
            },
          },
          {
            nama: {
              contains: getReq.search,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    if (getReq.tipe) {
      filter.push({
        tipe: getReq.tipe,
      });
    }

    if (getReq.kodeBeasiswa) {
      filter.push({
        kodeBeasiswa: getReq.kodeBeasiswa,
      });
    }

    const criteria = await this.prismaService.kriteria.findMany({
      where: {
        AND: filter,
      },
      include: {
        beasiswa: {
          select: {
            nama: true,
          },
        },
      },
      skip: (getReq.page - 1) * getReq.limit,
      take: getReq.limit,
      orderBy: {
        kode: 'desc',
      },
    });

    const total = await this.prismaService.kriteria.count({
      where: {
        AND: filter,
      },
    });

    return {
      data: criteria,
      paging: {
        limit: getReq.limit,
        totalPage: Math.ceil(total / getReq.limit),
        page: getReq.page,
        total: total,
      },
    };
  }

  async select(
    kodeBeasiswa?: string,
    search?: string,
  ): Promise<CriteriaResponse[]> {
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
            nama: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    if (kodeBeasiswa) {
      filter.push({
        kodeBeasiswa: kodeBeasiswa,
      });
    }

    const criteria = await this.prismaService.kriteria.findMany({
      where: {
        AND: filter,
      },
      include: {
        beasiswa: {
          select: {
            nama: true,
          },
        },
      },
    });

    return criteria;
  }

  async getByBeasiswaCode(kodeBeasiswa: string): Promise<CriteriaResponse[]> {
    const alternatif = await this.prismaService.kriteria.findMany({
      where: {
        kodeBeasiswa: kodeBeasiswa,
      },
    });

    if (alternatif.length === 0) {
      throw new HttpException(
        'Kriteria dengan Kode beasiswa tersebut tidak ditemukan',
        404,
      );
    }

    return alternatif;
  }

  async create(request: ReqPostCriteria): Promise<CriteriaResponse> {
    const criteriaReq: ReqPostCriteria = this.validationService.validate(
      CrteriaValidation.CREATE,
      request,
    ) as ReqPostCriteria;

    const criteriaMap: Record<string, TipeKriteria> = {
      Keuntungan: TipeKriteria.Keuntungan,
      Biaya: TipeKriteria.Biaya,
    };

    if (!criteriaMap[criteriaReq.tipe]) {
      throw new HttpException(
        {
          message: 'Tipe kriteria tidak ditemukan',
          path: ['tipe'],
        },
        400,
      );
    }

    const isExistCode = await this.prismaService.kriteria.findUnique({
      where: {
        kode: criteriaReq.kode,
      },
    });

    if (isExistCode && isExistCode.kode) {
      throw new HttpException(
        {
          message: 'Kode kriteria sudah digunakan',
          path: ['kode'],
        },
        400,
      );
    }

    const isExistNameCode = await this.prismaService.kriteria.findFirst({
      where: {
        nama: criteriaReq.nama,
        kodeBeasiswa: criteriaReq.kodeBeasiswa,
      },
      include: {
        beasiswa: true,
      },
    });

    if (isExistNameCode && isExistNameCode.nama) {
      throw new HttpException(
        `Kriteria dengan nama tersebut sudah ada pada beasiswa ${isExistNameCode.beasiswa.nama}`,
        400,
      );
    }

    const result = await this.prismaService.kriteria.aggregate({
      where: {
        kodeBeasiswa: criteriaReq.kodeBeasiswa,
      },
      _sum: {
        bobot: true,
      },
    });

    const totalBobot =
      Number(result._sum.bobot ?? 0) + Number(criteriaReq.bobot);

    if (totalBobot > 1) {
      throw new HttpException(
        {
          message: 'Total bobot kriteria sudah melebihi 1',
          path: ['bobot'],
        },
        400,
      );
    }

    const res = await this.prismaService.kriteria.create({
      data: {
        kode: criteriaReq.kode,
        nama: criteriaReq.nama,
        tipe: criteriaMap[criteriaReq.tipe],
        bobot: Number(criteriaReq.bobot.toFixed(2)),
        kodeBeasiswa: criteriaReq.kodeBeasiswa,
      },
    });

    return res;
  }

  async put(request: ReqPutCriteria, kode: string): Promise<CriteriaResponse> {
    const criteriaReq: ReqPutCriteria = this.validationService.validate(
      CrteriaValidation.PUT,
      request,
    ) as ReqPutCriteria;

    const criteriaMap: Record<string, TipeKriteria> = {
      Keuntungan: TipeKriteria.Keuntungan,
      Biaya: TipeKriteria.Biaya,
    };

    if (!criteriaMap[criteriaReq.tipe]) {
      throw new HttpException(
        {
          message: 'Tipe kriteria tidak ditemukan',
          path: ['tipe'],
        },
        400,
      );
    }

    const notFound = await this.prismaService.kriteria.findUnique({
      where: {
        kode: kode,
      },
    });

    if (!notFound) {
      throw new HttpException(
        {
          message: 'Kriteria tidak ditemukan',
          path: ['kode'],
        },
        404,
      );
    }

    const isExistCode = await this.prismaService.kriteria.findUnique({
      where: {
        kode: criteriaReq.kode,
        NOT: {
          kode: kode,
        },
      },
    });

    if (isExistCode && isExistCode.kode) {
      throw new HttpException(
        {
          message: 'Kode kriteria sudah digunakan',
          path: ['kode'],
        },
        400,
      );
    }

    const isExistNameCode = await this.prismaService.kriteria.findFirst({
      where: {
        nama: criteriaReq.nama,
        kodeBeasiswa: criteriaReq.kodeBeasiswa,
        NOT: {
          kode: kode,
        },
      },
      include: {
        beasiswa: true,
      },
    });

    if (isExistNameCode && isExistNameCode.nama) {
      throw new HttpException(
        `Kriteria dengan nama tersebut sudah ada pada beasiswa ${isExistNameCode.beasiswa.nama}`,
        400,
      );
    }

    const result = await this.prismaService.kriteria.aggregate({
      where: {
        kodeBeasiswa: criteriaReq.kodeBeasiswa,
        NOT: {
          kode: kode,
        },
      },
      _sum: {
        bobot: true,
      },
    });

    const totalBobot =
      Number(result._sum.bobot ?? 0) + Number(criteriaReq.bobot);

    if (totalBobot > 1) {
      throw new HttpException(
        {
          message: 'Total bobot kriteria sudah melebihi 1',
          path: ['bobot'],
        },
        400,
      );
    }

    const res = await this.prismaService.kriteria.update({
      where: {
        kode: kode,
      },
      data: {
        kode: criteriaReq.kode,
        nama: criteriaReq.nama,
        tipe: criteriaMap[criteriaReq.tipe],
        bobot: Number(criteriaReq.bobot.toFixed(3)),
        kodeBeasiswa: criteriaReq.kodeBeasiswa,
      },
    });

    return res;
  }

  async delete(request: ReqDeleteCriteria) {
    const kriteria = await this.prismaService.kriteria.findMany({
      where: {
        kode: {
          in: request.selected,
        },
      },
    });

    if (kriteria.length == 0 || kriteria.length < request.selected.length) {
      throw new HttpException('kriteria tidak ditemukan', 404);
    }

    const deletKriteria = await this.prismaService.kriteria.deleteMany({
      where: {
        kode: {
          in: request.selected,
        },
      },
    });
    if (
      deletKriteria.count == 0 ||
      deletKriteria.count < request.selected.length
    ) {
      throw new HttpException('kriteria tidak ditemukan', 404);
    }

    return deletKriteria;
  }

  async changeType(request: { tipe: string }, kode: string) {
    const criteriaReq = this.validationService.validate(
      CrteriaValidation.TYPE,
      request,
    ) as { tipe: string };

    const criteriaMap: Record<string, TipeKriteria> = {
      Keuntungan: TipeKriteria.Keuntungan,
      Biaya: TipeKriteria.Biaya,
    };

    const notFound = await this.prismaService.kriteria.findUnique({
      where: {
        kode: kode,
      },
    });

    if (!notFound) {
      throw new HttpException(
        'Kriteria dengan kode tersebut tidak ditemukan',
        404,
      );
    }

    const result = await this.prismaService.kriteria.update({
      where: {
        kode: kode,
      },
      data: {
        tipe: criteriaMap[criteriaReq.tipe],
      },
    });
    return result;
  }
}
