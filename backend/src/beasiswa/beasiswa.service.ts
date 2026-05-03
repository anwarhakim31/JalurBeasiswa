import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import {
  BeasiswaResponse,
  ReqDeleteBeasiswa,
  ReqGetAllBeasiswa,
  ReqPostBeasiswa,
  ReqPutBeasiswa,
} from '../models/beasiswa.model';
import { BeasiswaValidation } from './beasiswa.validaton';
import { Paging } from '../models/web.model';
import { nanoid } from 'nanoid';

@Injectable()
export class BeasiswaService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async GetAll(
    request: ReqGetAllBeasiswa,
  ): Promise<{ data: BeasiswaResponse[]; paging?: Paging }> {
    const getReq: ReqGetAllBeasiswa = this.validationService.validate(
      BeasiswaValidation.GETALL,
      request,
    ) as ReqGetAllBeasiswa;

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
          {
            periode: {
              contains: getReq.search,
              mode: 'insensitive',
            },
          },
          {
            deskripsi: {
              contains: getReq.search,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    if (getReq.status === 'true' || getReq.status === 'false') {
      filter.push({
        status: getReq.status === 'true',
      });
    }

    const result = await this.prismaService.beasiswa.findMany({
      where: {
        AND: filter,
      },
      skip: (getReq.page - 1) * getReq.limit,
      take: getReq.limit,
      orderBy: {
        kode: 'desc',
      },
      select: {
        id: true,
        kode: true,
        nama: true,
        deskripsi: true,
        periode: true,
        status: true,
        dibuatPada: true,
      },
    });

    const total = await this.prismaService.beasiswa.count({
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

  async getByCode(kode: string): Promise<BeasiswaResponse> {
    const beasiswa = await this.prismaService.beasiswa.findUnique({
      where: {
        kode: kode,
      },
      select: {
        id: true,
        kode: true,
        nama: true,
        deskripsi: true,
        periode: true,
        status: true,
        dibuatPada: true,
      },
    });

    if (!beasiswa) {
      throw new HttpException(
        {
          message: 'Beasiswa tidak ditemukan',
          path: ['kode'],
        },
        404,
      );
    }

    return beasiswa;
  }

  async getForSelect(
    request: ReqGetAllBeasiswa,
  ): Promise<{ data: BeasiswaResponse[] }> {
    const getReq: ReqGetAllBeasiswa = this.validationService.validate(
      BeasiswaValidation.GETALL,
      request,
    ) as ReqGetAllBeasiswa;

    const filter = [];

    if (getReq.search) {
      filter.push({
        OR: [
          {
            nama: {
              contains: getReq.search,
              mode: 'insensitive',
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

    const result = await this.prismaService.beasiswa.findMany({
      where: {
        AND: filter,
        status: true,
      },
      skip: (getReq.page - 1) * getReq.limit,
      take: getReq.limit,
      orderBy: {
        dibuatPada: 'desc',
      },
    });

    return {
      data: result,
    };
  }

  async create(request: ReqPostBeasiswa): Promise<BeasiswaResponse> {
    const ReqPost: ReqPostBeasiswa = this.validationService.validate(
      BeasiswaValidation.CREATE,
      request,
    ) as ReqPostBeasiswa;

    const isExistCode = await this.prismaService.beasiswa.findUnique({
      where: {
        kode: ReqPost.kode,
      },
    });

    if (isExistCode) {
      throw new HttpException(
        {
          message: 'Beasiswa dengan kode tersebut sudah ada',
          field: ['kode'],
        },
        400,
      );
    }

    const isExist = await this.prismaService.beasiswa.findFirst({
      where: {
        nama: ReqPost.nama,
        periode: ReqPost.periode,
      },
    });

    if (isExist) {
      throw new HttpException(
        'Beasiswa dengan nama dan periode tersebut sudah ada',
        400,
      );
    }

    const result = await this.prismaService.beasiswa.create({
      data: {
        id: nanoid(8),
        kode: ReqPost.kode,
        nama: ReqPost.nama,
        deskripsi: ReqPost.deskripsi,
        periode: ReqPost.periode,
        status: ReqPost.status,
      },
      select: {
        id: true,
        nama: true,
        kode: true,
        deskripsi: true,
        periode: true,
        status: true,
        dibuatPada: true,
      },
    });

    return {
      id: result.id,
      kode: result.kode,
      nama: result.nama,
      deskripsi: result.deskripsi,
      periode: result.periode,
      status: result.status,
      dibuatPada: result.dibuatPada,
    };
  }
  async update(
    request: ReqPutBeasiswa,
    kode: string,
  ): Promise<BeasiswaResponse> {
    const ReqPost: ReqPutBeasiswa = this.validationService.validate(
      BeasiswaValidation.PUT,
      request,
    ) as ReqPutBeasiswa;

    const notFoud = await this.prismaService.beasiswa.findUnique({
      where: {
        kode: kode,
      },
    });

    if (!notFoud) {
      throw new HttpException(
        'Beasiswa dengan id tersebut tidak ditemukan',
        404,
      );
    }

    const isExistCode = await this.prismaService.beasiswa.findUnique({
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
          message: 'Beasiswa dengan kode tersebut sudah ada',
          field: ['kode'],
        },
        400,
      );
    }

    const isExist = await this.prismaService.beasiswa.findFirst({
      where: {
        nama: ReqPost.nama,
        periode: ReqPost.periode,
        NOT: {
          kode: kode,
        },
      },
    });

    if (isExist) {
      throw new HttpException(
        'Beasiswa dengan nama dan periode tersebut sudah ada',
        400,
      );
    }

    const result = await this.prismaService.beasiswa.update({
      where: {
        kode: kode,
      },
      data: {
        nama: ReqPost.nama,
        deskripsi: ReqPost.deskripsi,
        kode: ReqPost.kode,
        periode: ReqPost.periode,
        status: ReqPost.status,
      },
    });

    return {
      id: result.id,
      kode: result.kode,
      nama: result.nama,
      deskripsi: result.deskripsi,
      periode: result.periode,
      status: result.status,
      dibuatPada: result.dibuatPada,
    };
  }
  async delete(request: ReqDeleteBeasiswa) {
    const beasiswa = await this.prismaService.beasiswa.findMany({
      where: {
        kode: {
          in: request.selected,
        },
      },
    });

    if (beasiswa.length == 0 || beasiswa.length < request.selected.length) {
      throw new HttpException('beasiswa tidak ditemukan', 404);
    }

    const deleteBeasiswa = await this.prismaService.beasiswa.deleteMany({
      where: {
        kode: {
          in: request.selected,
        },
      },
    });
    if (
      deleteBeasiswa.count == 0 ||
      deleteBeasiswa.count < request.selected.length
    ) {
      throw new HttpException('Beasiswa tidak ditemukan', 404);
    }

    return deleteBeasiswa;
  }
  async changeStatus(request: { status: boolean }, kode: string) {
    const reqStatus = this.validationService.validate(
      BeasiswaValidation.STATUS,
      request,
    ) as { status: boolean };

    const notFound = await this.prismaService.beasiswa.findUnique({
      where: {
        kode: kode,
      },
    });
    if (!notFound) {
      throw new HttpException(
        'Beasiswa dengan id tersebut tidak ditemukan',
        404,
      );
    }

    const result = await this.prismaService.beasiswa.update({
      where: {
        kode: kode,
      },
      data: {
        status: reqStatus.status,
      },
    });
    return result;
  }
}
