import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';

import { AlternativeValueValidation } from './alternative-value.validation';
import { Paging } from '../models/web.model';
import { nanoid } from 'nanoid';

import {
  AlternativeValueResponse,
  ReqGetAllAlternativeValue,
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
        kriteria: true,
        alternatif: true,
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
      AlternativeValueValidation.CREATE,
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
  async update(
    request: ReqPutAlternative,
    code: string,
  ): Promise<AlternativeResponse> {
    const ReqPost: ReqPutAlternative = this.validationService.validate(
      AlternativeValueValidation.PUT,
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
