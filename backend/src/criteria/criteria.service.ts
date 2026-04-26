import { HttpException, Injectable } from '@nestjs/common';

import { Paging } from '../models/web.model';
import { ValidationService } from '../common/validation.service';
import { PrismaService } from '../common/prisma.service';
import { CrteriaValidation } from './criteria.validation';
import { creteriaType } from '@prisma/client';
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
            code: {
              contains: getReq.search,
              mode: 'insensitive',
            },
          },
          {
            name: {
              contains: getReq.search,
              mode: 'insensitive',
            },
          },
          {
            beasiswa: {
              name: {
                contains: getReq.search,
                mode: 'insensitive',
              },
            },
          },
          {
            beasiswaCode: {
              contains: getReq.search,
              mode: 'insensitive',
            },
          },
        ],
      });
    }
    if (getReq.type) {
      filter.push({
        type: getReq.type,
      });
    }

    const criteria = await this.prismaService.kriteria.findMany({
      where: {
        AND: filter,
      },
      skip: (getReq.page - 1) * getReq.limit,
      take: getReq.limit,
      orderBy: {
        createdAt: 'desc',
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

  // async getForSelect(
  //   request: ReqGetAllUser,
  // ): Promise<{ data: UserResponse[] }> {
  //   const getReq: ReqGetAllUser = this.validationService.validate(
  //     CrteriaValidation.GETALL,
  //     request,
  //   );

  //   const filter = [];

  //   if (getReq.search) {
  //     filter.push({
  //       OR: [
  //         {
  //           nim: {
  //             contains: getReq.search,
  //             mode: 'insensitive',
  //           },
  //         },
  //         {
  //           fullname: {
  //             contains: getReq.search,
  //             mode: 'insensitive',
  //           },
  //         },
  //       ],
  //     });
  //   }

  //   const user = await this.prismaService.pengguna.findMany({
  //     where: {
  //       AND: filter,
  //       fullname: {
  //         not: null,
  //       },
  //       prodi: {
  //         not: null,
  //       },
  //       batch: {
  //         not: null,
  //       },
  //       isAdmin: false,
  //       status: UserStatus.ACCEPT,
  //     },
  //     skip: (getReq.page - 1) * getReq.limit,
  //     take: getReq.limit,
  //     orderBy: {
  //       createdAt: 'desc',
  //     },
  //     select: {
  //       nim: true,
  //       fullname: true,
  //       email: true,
  //     },
  //   });

  //   return {
  //     data: user,
  //   };
  // }

  // async delete(request: ReqDeletePengguna) {
  //   const users = await this.prismaService.pengguna.findMany({
  //     where: {
  //       nim: {
  //         in: request.selected,
  //       },
  //     },
  //   });

  //   if (users.length == 0 || users.length < request.selected.length) {
  //     throw new HttpException(
  //       {
  //         message: 'pengguna tidak ditemukan',
  //         path: ['selected'],
  //       },
  //       404,
  //     );
  //   }

  //   const user = await this.prismaService.pengguna.deleteMany({
  //     where: {
  //       nim: {
  //         in: request.selected,
  //       },
  //     },
  //   });
  //   if (user.count == 0 || user.count < request.selected.length) {
  //     throw new HttpException(
  //       {
  //         message: 'pengguna tidak ditemukan',
  //         path: ['selected'],
  //       },
  //       404,
  //     );
  //   }

  //   await this.prismaService.alternatif.deleteMany({
  //     where: {
  //       nim: {
  //         in: request.selected,
  //       },
  //     },
  //   });

  //   return user;
  // }

  async create(request: ReqPostCriteria): Promise<CriteriaResponse> {
    const criteriaReq: ReqPostCriteria = this.validationService.validate(
      CrteriaValidation.CREATE,
      request,
    ) as ReqPostCriteria;

    const criteriaMap: Record<string, creteriaType> = {
      BENEFIT: creteriaType.BENEFIT,
      COST: creteriaType.COST,
    };

    if (!criteriaMap[criteriaReq.type]) {
      throw new HttpException(
        {
          message: 'Tipe kriteria tidak ditemukan',
          path: ['type'],
        },
        400,
      );
    }

    const isExistCode = await this.prismaService.kriteria.findUnique({
      where: {
        code: criteriaReq.code,
      },
    });

    if (isExistCode && isExistCode.code) {
      throw new HttpException(
        {
          message: 'Kode kriteria sudah digunakan',
          path: ['code'],
        },
        400,
      );
    }

    const res = await this.prismaService.kriteria.create({
      data: {
        code: criteriaReq.code,
        name: criteriaReq.name,
        type: criteriaMap[criteriaReq.type],
        weight: criteriaReq.weight,
        beasiswaCode: criteriaReq.beasiswaCode,
      },
    });

    return res;
  }

  async put(request: ReqPutCriteria, code: string): Promise<CriteriaResponse> {
    const criteriaReq: ReqPutCriteria = this.validationService.validate(
      CrteriaValidation.PUT,
      request,
    ) as ReqPutCriteria;

    const criteriaMap: Record<string, creteriaType> = {
      BENEFIT: creteriaType.BENEFIT,
      COST: creteriaType.COST,
    };

    const notFound = await this.prismaService.kriteria.findUnique({
      where: {
        code: code,
      },
    });

    if (!notFound) {
      throw new HttpException(
        {
          message: 'Kriteria tidak ditemukan',
          path: ['code'],
        },
        404,
      );
    }

    if (!criteriaMap[criteriaReq.type]) {
      throw new HttpException(
        {
          message: 'Tipe kriteria tidak ditemukan',
          path: ['type'],
        },
        400,
      );
    }

    const isExistCode = await this.prismaService.kriteria.findUnique({
      where: {
        code: criteriaReq.code,
        NOT: {
          code: code,
        },
      },
    });

    if (isExistCode && isExistCode.code) {
      throw new HttpException(
        {
          message: 'Kode kriteria sudah digunakan',
          path: ['code'],
        },
        400,
      );
    }

    const res = await this.prismaService.kriteria.update({
      where: {
        code: code,
      },
      data: {
        code: criteriaReq.code,
        name: criteriaReq.name,
        type: criteriaMap[criteriaReq.type],
        weight: criteriaReq.weight,
        beasiswaCode: criteriaReq.beasiswaCode,
      },
    });

    return res;
  }

  async delete(request: ReqDeleteCriteria) {
    const kriteria = await this.prismaService.kriteria.findMany({
      where: {
        code: {
          in: request.selected,
        },
      },
    });

    if (kriteria.length == 0 || kriteria.length < request.selected.length) {
      throw new HttpException('kriteria tidak ditemukan', 404);
    }

    const deletKriteria = await this.prismaService.kriteria.deleteMany({
      where: {
        code: {
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
}
