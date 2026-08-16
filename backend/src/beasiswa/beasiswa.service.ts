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

    const oneResult = await this.prismaService.beasiswa.findMany({
      where: {
        AND: filter,
      },
      skip: (getReq.page - 1) * getReq.limit,
      take: getReq.limit,
      orderBy: {
        kode: 'desc',
      },
    });
    const date = new Date();

    const newResult = oneResult.filter((item) => {
      return {
        ...item,
        tanggalSelesai: item.tanggalSelesai > date,
      };
    });

    await this.prismaService.beasiswa.updateMany({
      where: {
        id: {
          in: newResult.map((item) => item.id),
        },
      },
      data: {
        publikasi: false,
      },
    });

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

        status: true,
        tanggalMulai: true,
        tanggalSelesai: true,
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
        status: true,
        tanggalMulai: true,
        tanggalSelesai: true,
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

  async publish(kode: string): Promise<BeasiswaResponse> {
    const beasiswa = await this.prismaService.beasiswa.findUnique({
      where: {
        kode: kode,
      },
      select: {
        id: true,
        kode: true,
        nama: true,
        deskripsi: true,
        status: true,
        publikasi: true,
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

    const result = await this.prismaService.beasiswa.update({
      where: {
        id: beasiswa.id,
      },
      data: {
        publikasi: !beasiswa.publikasi,
      },
    });

    return result;
  }

  async create(request: ReqPostBeasiswa): Promise<BeasiswaResponse> {
    const ReqPost: ReqPostBeasiswa = this.validationService.validate(
      BeasiswaValidation.CREATE,
      request,
    ) as ReqPostBeasiswa;

    const firstLetter = ReqPost.kode.toUpperCase().charAt(0) !== 'B';
    const onlyThisLetter = /^B\d+$/i.test(ReqPost.kode);

    if (firstLetter) {
      throw new HttpException(
        { message: 'Kode harus dimulai dengan B', field: ['kode'] },
        400,
      );
    }

    if (!onlyThisLetter) {
      throw new HttpException(
        {
          message: 'Kode hanya boleh menggunakan huruf B dan angka',
          field: ['kode'],
        },
        400,
      );
    }

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
        kode: ReqPost.kode.toUpperCase(),
        nama: ReqPost.nama,
        deskripsi: ReqPost.deskripsi,

        status: ReqPost.status,
        tanggalMulai: ReqPost.tanggalMulai,
        tanggalSelesai: ReqPost.tanggalSelesai,
      },
      select: {
        id: true,
        nama: true,
        kode: true,
        deskripsi: true,

        status: true,
        dibuatPada: true,
        tanggalMulai: true,
        tanggalSelesai: true,
      },
    });

    return {
      id: result.id,
      kode: result.kode,
      nama: result.nama,
      deskripsi: result.deskripsi,

      status: result.status,
      dibuatPada: result.dibuatPada,
      tanggalMulai: result.tanggalMulai,
      tanggalSelesai: result.tanggalSelesai,
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
        'Beasiswa dengan kode tersebut tidak ditemukan',
        404,
      );
    }
    const firstLetter = ReqPost.kode.toUpperCase().charAt(0) !== 'B';
    const onlyThisLetter = /^B\d+$/i.test(ReqPost.kode);

    if (firstLetter) {
      throw new HttpException(
        { message: 'Kode harus dimulai dengan B', field: ['kode'] },
        400,
      );
    }

    if (!onlyThisLetter) {
      throw new HttpException(
        {
          message: 'Kode hanya boleh menggunakan huruf B dan angka',
          field: ['kode'],
        },
        400,
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

        status: ReqPost.status,
        tanggalMulai: ReqPost.tanggalMulai,
        tanggalSelesai: ReqPost.tanggalSelesai,
      },
    });

    return {
      id: result.id,
      kode: result.kode,
      nama: result.nama,
      deskripsi: result.deskripsi,

      status: result.status,
      dibuatPada: result.dibuatPada,
      tanggalMulai: result.tanggalMulai,
      tanggalSelesai: result.tanggalSelesai,
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

    const found = await this.prismaService.beasiswa.findUnique({
      where: {
        kode: kode,
      },
    });

    if (!found) {
      throw new HttpException(
        'Beasiswa dengan id tersebut tidak ditemukan',
        404,
      );
    }

    const date = new Date();

    if (date.getTime() > found.tanggalSelesai.getTime() && reqStatus.status) {
      throw new HttpException(
        'Mengubah status gagal, Tanggal sudah melewati tanggal selesai',
        400,
      );
    }

    if (found.tanggalMulai.getTime() === found.tanggalSelesai.getTime()) {
      throw new HttpException(
        'Mengubah status gagal, Tanggal mulai dan selesai tidak boleh sama',
        400,
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
