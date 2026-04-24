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
            id: {
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

    const isExist = await this.prismaService.alternatif.findFirst({
      where: {
        nim: ReqPost.nim,
        beasiswaId: ReqPost.beasiswaId,
      },
    });

    if (isExist) {
      throw new HttpException(
        'Alternatif dengan Mahasiswa dan Beasiswa tersebut sudah ada',
        400,
      );
    }

    const result = await this.prismaService.alternatif.create({
      data: {
        id: nanoid(8),
        nim: ReqPost.nim,
        beasiswaId: ReqPost.beasiswaId,
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
      name: result.beasiswa.name,
      nim: result.nim,
      beasiswaId: result.beasiswaId,
      fullname: result.pengguna.fullname,
    };
  }
  async update(
    request: ReqPutAlternative,
    id: string,
  ): Promise<AlternativeResponse> {
    const ReqPost: ReqPutAlternative = this.validationService.validate(
      AlternativeValidation.PUT,
      request,
    ) as ReqPutAlternative;

    const notFoud = await this.prismaService.alternatif.findUnique({
      where: {
        id: id,
      },
    });

    if (!notFoud) {
      throw new HttpException(
        'Alternatif dengan id tersebut tidak ditemukan',
        404,
      );
    }

    const isExist = await this.prismaService.alternatif.findFirst({
      where: {
        nim: ReqPost.nim,
        beasiswaId: ReqPost.beasiswaId,
        NOT: {
          id: id,
        },
      },
    });

    if (isExist) {
      throw new HttpException(
        'Alternatif dengan Mahasiswa dan Beasiswa tersebut sudah ada',
        400,
      );
    }

    const result = await this.prismaService.alternatif.update({
      where: {
        id: id,
      },
      data: {
        nim: ReqPost.nim,
        beasiswaId: ReqPost.beasiswaId,
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
      name: result.beasiswa.name,
      nim: result.nim,
      beasiswaId: result.beasiswaId,
      fullname: result.pengguna.fullname,
    };
  }
  async delete(request: ReqDeleteAlternative) {
    const alternatif = await this.prismaService.alternatif.findMany({
      where: {
        id: {
          in: request.selected,
        },
      },
    });

    if (alternatif.length == 0 || alternatif.length < request.selected.length) {
      throw new HttpException('Alternatif tidak ditemukan', 404);
    }

    const deleteAlternatif = await this.prismaService.alternatif.deleteMany({
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
      throw new HttpException('Alternatif tidak ditemukan', 404);
    }

    return deleteAlternatif;
  }
}
