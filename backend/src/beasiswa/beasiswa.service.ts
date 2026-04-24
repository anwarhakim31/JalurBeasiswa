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
            name: {
              contains: getReq.search,
              mode: 'insensitive',
            },
          },
          {
            period: {
              contains: getReq.search,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: getReq.search,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    if (getReq.status === 'true' || getReq.status === 'false') {
      filter.push({
        isActive: getReq.status === 'true',
      });
    }

    const result = await this.prismaService.beasiswa.findMany({
      where: {
        AND: filter,
      },
      skip: (getReq.page - 1) * getReq.limit,
      take: getReq.limit,
      orderBy: {
        createdAt: 'desc',
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
            name: {
              contains: getReq.search,
              mode: 'insensitive',
            },
          },
          {
            id: {
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
        isActive: true,
      },
      skip: (getReq.page - 1) * getReq.limit,
      take: getReq.limit,
      orderBy: {
        createdAt: 'desc',
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

    const isExist = await this.prismaService.beasiswa.findFirst({
      where: {
        name: ReqPost.name,
        period: ReqPost.period,
      },
    });

    if (isExist) {
      throw new HttpException(
        {
          message: 'Nama beasiswa dengan periode yang sama sudah ada',
          path: ['name'],
        },
        400,
      );
    }

    const result = await this.prismaService.beasiswa.create({
      data: {
        id: nanoid(8),
        name: ReqPost.name,
        description: ReqPost.description,
        period: ReqPost.period,
        isActive: ReqPost.isActive,
      },
    });

    return {
      id: result.id,
      name: result.name,
      description: result.description,
      period: result.period,
      isActive: result.isActive,
      createdAt: result.createdAt,
    };
  }
  async update(request: ReqPutBeasiswa, id: string): Promise<BeasiswaResponse> {
    const ReqPost: ReqPutBeasiswa = this.validationService.validate(
      BeasiswaValidation.PUT,
      request,
    ) as ReqPutBeasiswa;

    const notFoud = await this.prismaService.beasiswa.findUnique({
      where: {
        id: id,
      },
    });

    if (!notFoud) {
      throw new HttpException(
        'Beasiswa dengan id tersebut tidak ditemukan',
        404,
      );
    }

    const isExist = await this.prismaService.beasiswa.findFirst({
      where: {
        name: ReqPost.name,
        period: ReqPost.period,
        NOT: {
          id: id,
        },
      },
    });

    if (isExist) {
      throw new HttpException(
        {
          message: 'Nama beasiswa dengan periode yang sama sudah ada',
          path: ['name'],
        },
        400,
      );
    }

    const result = await this.prismaService.beasiswa.update({
      where: {
        id: id,
      },
      data: {
        name: ReqPost.name,
        description: ReqPost.description,
        period: ReqPost.period,
        isActive: ReqPost.isActive,
      },
    });

    return {
      id: result.id,
      name: result.name,
      description: result.description,
      period: result.period,
      isActive: result.isActive,
      createdAt: result.createdAt,
    };
  }
  async delete(request: ReqDeleteBeasiswa) {
    const beasiswa = await this.prismaService.beasiswa.findMany({
      where: {
        id: {
          in: request.selected,
        },
      },
    });

    if (beasiswa.length == 0 || beasiswa.length < request.selected.length) {
      throw new HttpException('beasiswa tidak ditemukan', 404);
    }

    const deleteBeasiswa = await this.prismaService.beasiswa.deleteMany({
      where: {
        id: {
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
  async changeStatus(request: { isActive: boolean }, id: string) {
    const reqStatus = this.validationService.validate(
      BeasiswaValidation.STATUS,
      request,
    ) as { isActive: boolean };

    const notFound = await this.prismaService.beasiswa.findUnique({
      where: {
        id: id,
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
        id: id,
      },
      data: {
        isActive: reqStatus.isActive,
      },
    });
    return result;
  }
}
