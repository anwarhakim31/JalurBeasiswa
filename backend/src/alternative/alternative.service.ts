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
            kode: {
              contains: getReq.search,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    if (getReq.kodeBeasiswa) {
      filter.push({
        kodeBeasiswa: getReq.kodeBeasiswa,
      });
    }

    const result = await this.prismaService.alternatif.findMany({
      where: {
        AND: filter,
      },
      include: {
        pengguna: {
          select: {
            namaLengkap: true,
          },
        },
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
        kode: ReqPost.kode,
      },
    });

    if (isExistCode) {
      throw new HttpException(
        {
          message: 'Alternatif dengan kode tersebut sudah ada',
          path: ['kode'],
        },
        400,
      );
    }

    const isExist = await this.prismaService.alternatif.findFirst({
      where: {
        nim: ReqPost.nim,
        kodeBeasiswa: ReqPost.kodeBeasiswa,
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
        kode: ReqPost.kode,
        nim: ReqPost.nim,
        kodeBeasiswa: ReqPost.kodeBeasiswa,
      },
      include: {
        beasiswa: {
          select: {
            nama: true,
          },
        },
        pengguna: {
          select: {
            namaLengkap: true,
          },
        },
      },
    });

    return {
      id: result.id,
      kode: result.kode,
      nama: result.beasiswa.nama,
      nim: result.nim,
      kodeBeasiswa: result.kodeBeasiswa,
      namaLengkap: result.pengguna.namaLengkap,
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
            kode: {
              contains: getReq.search,
              mode: 'insensitive',
            },
          },
          {
            pengguna: {
              namaLengkap: {
                contains: getReq.search,
                mode: 'insensitive',
              },
            },
          },
          {
            kodeBeasiswa: {
              contains: getReq.search,
              mode: 'insensitive',
            },
          },
          {
            beasiswa: {
              nama: {
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
            namaLengkap: true,
          },
        },
        beasiswa: {
          select: {
            nama: true,
          },
        },
      },
      skip: (getReq.page - 1) * getReq.limit,
      take: getReq.limit,
      orderBy: {
        dibuatPada: 'desc',
      },
    });

    return alternatif.map((item) => ({
      id: item.id,
      nim: item.nim,
      namaLengkap: item.pengguna.namaLengkap,
      kode: item.kode,
      nama: item.beasiswa.nama,
      kodeBeasiswa: item.kodeBeasiswa,
      dibuatPada: item.dibuatPada,
    }));
  }

  async update(
    request: ReqPutAlternative,
    kode: string,
  ): Promise<AlternativeResponse> {
    const ReqPost: ReqPutAlternative = this.validationService.validate(
      AlternativeValidation.PUT,
      request,
    ) as ReqPutAlternative;

    const notFoud = await this.prismaService.alternatif.findUnique({
      where: {
        kode: kode,
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
        kode: ReqPost.kode,
        NOT: {
          kode: kode,
        },
      },
    });

    if (isExistCode) {
      throw new HttpException(
        {
          message: 'Alternatif dengan kode tersebut sudah ada',
          path: ['kode'],
        },
        400,
      );
    }

    const isExist = await this.prismaService.alternatif.findFirst({
      where: {
        nim: ReqPost.nim,
        kodeBeasiswa: ReqPost.kodeBeasiswa,
        NOT: {
          kode: kode,
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
        kode: kode,
      },
      data: {
        kode: ReqPost.kode,
        nim: ReqPost.nim,
        kodeBeasiswa: ReqPost.kodeBeasiswa,
      },
      include: {
        beasiswa: {
          select: {
            nama: true,
          },
        },
        pengguna: {
          select: {
            namaLengkap: true,
          },
        },
      },
    });

    return {
      kode: result.kode,
      id: result.id,
      nama: result.beasiswa.nama,
      nim: result.nim,
      kodeBeasiswa: result.kodeBeasiswa,
      namaLengkap: result.pengguna.namaLengkap,
    };
  }
  async delete(request: ReqDeleteAlternative) {
    const alternatif = await this.prismaService.alternatif.findMany({
      where: {
        kode: {
          in: request.selected,
        },
      },
    });

    if (alternatif.length == 0 || alternatif.length < request.selected.length) {
      throw new HttpException('Alternatif tidak ditemukan', 404);
    }

    const deleteAlternatif = await this.prismaService.alternatif.deleteMany({
      where: {
        kode: {
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
