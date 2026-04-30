import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';

import { AlternativeValidation } from './alternative.validation';
import { Paging } from '../models/web.model';
import { nanoid } from 'nanoid';
import {
  AlternativeResponse,
  ReqDeleteAlternative,
  ReqGetAllAlternative,
  ReqPostAlternative,
  ReqPutAlternative,
} from '../models/alternative.model';

@Injectable()
export class AlternativeService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async GetAll(
    request: ReqGetAllAlternative,
  ): Promise<{ data: AlternativeResponse[]; paging?: Paging }> {
    const getReq: ReqGetAllAlternative = this.validationService.validate(
      AlternativeValidation.GETALL,
      request,
    ) as ReqGetAllAlternative;

    const filter = [];

    if (getReq.search) {
      filter.push({
        OR: [
          {
            nim: {
              contains: getReq.search,
              mode: 'insensitive',
            },
          },
          {
            pengguna: {
              fullname: {
                contains: getReq.search,
                mode: 'insensitive',
              },
            },
          },
          {
            code: {
              contains: getReq.search,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    if (getReq.beasiswaCode) {
      filter.push({
        beasiswaCode: getReq.beasiswaCode,
      });
    }

    const result = await this.prismaService.alternatif.findMany({
      where: {
        AND: filter,
      },
      include: {
        pengguna: {
          select: {
            fullname: true,
          },
        },
        beasiswa: {
          select: {
            name: true,
          },
        },
      },
      skip: (getReq.page - 1) * getReq.limit,
      take: getReq.limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await this.prismaService.alternatif.count({
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

  async create(request: ReqPostAlternative): Promise<AlternativeResponse> {
    const ReqPost: ReqPostAlternative = this.validationService.validate(
      AlternativeValidation.CREATE,
      request,
    ) as ReqPostAlternative;

    const isExistCode = await this.prismaService.alternatif.findUnique({
      where: {
        code: ReqPost.code,
      },
    });

    if (isExistCode) {
      throw new HttpException(
        {
          message: 'Alternatif dengan kode tersebut sudah ada',
          path: ['code'],
        },
        400,
      );
    }

    const isExist = await this.prismaService.alternatif.findFirst({
      where: {
        nim: ReqPost.nim,
        beasiswaCode: ReqPost.beasiswaCode,
      },
    });

    if (isExist) {
      throw new HttpException(
        'Alternatif dengan Mahasiswa dan Beasiswa tersebut sudahh terdaftar',
        400,
      );
    }

    const result = await this.prismaService.alternatif.create({
      data: {
        id: nanoid(8),
        code: ReqPost.code,
        nim: ReqPost.nim,
        beasiswaCode: ReqPost.beasiswaCode,
      },
      include: {
        beasiswa: {
          select: {
            name: true,
          },
        },
        pengguna: {
          select: {
            fullname: true,
          },
        },
      },
    });

    return {
      id: result.id,
      code: result.code,
      name: result.beasiswa.name,
      nim: result.nim,
      beasiswaCode: result.beasiswaCode,
      fullname: result.pengguna.fullname,
    };
  }

  async getForSelect(
    request: ReqGetAllAlternative,
  ): Promise<AlternativeResponse[]> {
    const getReq: ReqGetAllAlternative = this.validationService.validate(
      AlternativeValidation.GETALL,
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
            pengguna: {
              fullname: {
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
          {
            beasiswa: {
              name: {
                contains: getReq.search,
                mode: 'insensitive',
              },
            },
          },
        ],
      });
    }

    const alternatif = await this.prismaService.alternatif.findMany({
      where: {
        AND: filter,
      },
      include: {
        pengguna: {
          select: {
            fullname: true,
          },
        },
        beasiswa: {
          select: {
            name: true,
          },
        },
      },
      skip: (getReq.page - 1) * getReq.limit,
      take: getReq.limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return alternatif.map((item) => ({
      id: item.id,
      nim: item.nim,
      fullname: item.pengguna.fullname,
      code: item.code,
      name: item.beasiswa.name,
      beasiswaCode: item.beasiswaCode,
      createdAt: item.createdAt,
    }));
  }

  async update(
    request: ReqPutAlternative,
    code: string,
  ): Promise<AlternativeResponse> {
    const ReqPost: ReqPutAlternative = this.validationService.validate(
      AlternativeValidation.PUT,
      request,
    ) as ReqPutAlternative;

    const notFoud = await this.prismaService.alternatif.findUnique({
      where: {
        code: code,
      },
    });

    if (!notFoud) {
      throw new HttpException(
        'Alternatif dengan kode tersebut tidak ditemukan',
        404,
      );
    }

    const isExistCode = await this.prismaService.alternatif.findUnique({
      where: {
        code: ReqPost.code,
        NOT: {
          code: code,
        },
      },
    });

    if (isExistCode) {
      throw new HttpException(
        {
          message: 'Alternatif dengan kode tersebut sudah ada',
          path: ['code'],
        },
        400,
      );
    }

    const isExist = await this.prismaService.alternatif.findFirst({
      where: {
        nim: ReqPost.nim,
        beasiswaCode: ReqPost.beasiswaCode,
        NOT: {
          code: code,
        },
      },
    });

    if (isExist) {
      throw new HttpException(
        'Alternatif dengan Mahasiswa dan Beasiswa tersebut sudah terdaftar',
        400,
      );
    }

    const result = await this.prismaService.alternatif.update({
      where: {
        code: code,
      },
      data: {
        code: ReqPost.code,
        nim: ReqPost.nim,
        beasiswaCode: ReqPost.beasiswaCode,
      },
      include: {
        beasiswa: {
          select: {
            name: true,
          },
        },
        pengguna: {
          select: {
            fullname: true,
          },
        },
      },
    });

    return {
      code: result.code,
      id: result.id,
      name: result.beasiswa.name,
      nim: result.nim,
      beasiswaCode: result.beasiswaCode,
      fullname: result.pengguna.fullname,
    };
  }
  async delete(request: ReqDeleteAlternative) {
    const alternatif = await this.prismaService.alternatif.findMany({
      where: {
        code: {
          in: request.selected,
        },
      },
    });

    if (alternatif.length == 0 || alternatif.length < request.selected.length) {
      throw new HttpException('Alternatif tidak ditemukan', 404);
    }

    const deleteAlternatif = await this.prismaService.alternatif.deleteMany({
      where: {
        code: {
          in: request.selected,
        },
      },
    });
    if (
      deleteAlternatif.count == 0 ||
      deleteAlternatif.count < request.selected.length
    ) {
      throw new HttpException('Alternatif tidak ditemukan', 404);
    }

    return deleteAlternatif;
  }
}
