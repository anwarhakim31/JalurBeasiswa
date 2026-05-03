import { HttpException, Injectable } from '@nestjs/common';
import {
  ReqDeletePengguna,
  ReqGetAllUser,
  ReqPostPengguna,
  ReqPutPengguna,
  UserResponse,
} from '../models/user.model';
import * as bcrypt from 'bcrypt';
import { Paging } from '../models/web.model';
import { ValidationService } from '../common/validation.service';
import { PrismaService } from '../common/prisma.service';
import { UserValidation } from './user.validation';
import { StatusPengguna } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private validationService: ValidationService,
    private prismaService: PrismaService,
  ) {}
  async getAll(
    request: ReqGetAllUser,
  ): Promise<{ data: UserResponse[]; paging?: Paging }> {
    const getReq: ReqGetAllUser = this.validationService.validate(
      UserValidation.GETALL,
      request,
    );

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
            email: {
              contains: getReq.search,
              mode: 'insensitive',
            },
          },
          {
            namaLengkap: {
              contains: getReq.search,
              mode: 'insensitive',
            },
          },
          {
            prodi: {
              contains: getReq.search,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    if (getReq.status) {
      filter.push({
        status: getReq.status,
      });
    }

    const user = await this.prismaService.pengguna.findMany({
      where: {
        AND: filter,
        admin: false,
      },
      skip: (getReq.page - 1) * getReq.limit,
      take: getReq.limit,
      orderBy: {
        dibuatPada: 'desc',
      },
      select: {
        nim: true,
        email: true,
        status: true,
        namaLengkap: true,
        dibuatPada: true,
        prodi: true,
        angkatan: true,
        foto: true,
      },
    });

    const total = await this.prismaService.pengguna.count({
      where: {
        AND: filter,
        admin: false,
      },
    });

    return {
      data: user,
      paging: {
        limit: getReq.limit,
        totalPage: Math.ceil(total / getReq.limit),
        page: getReq.page,
        total: total,
      },
    };
  }

  async getForSelect(
    request: ReqGetAllUser,
  ): Promise<{ data: UserResponse[] }> {
    const getReq: ReqGetAllUser = this.validationService.validate(
      UserValidation.GETALL,
      request,
    );

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
            namaLengkap: {
              contains: getReq.search,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    const user = await this.prismaService.pengguna.findMany({
      where: {
        AND: filter,
        namaLengkap: {
          not: null,
        },
        prodi: {
          not: null,
        },
        angkatan: {
          not: null,
        },
        admin: false,
        status: StatusPengguna.Diterima,
      },
      skip: (getReq.page - 1) * getReq.limit,
      take: getReq.limit,
      orderBy: {
        dibuatPada: 'desc',
      },
      select: {
        nim: true,
        namaLengkap: true,
        email: true,
      },
    });

    return {
      data: user,
    };
  }

  async getByNIM(nim: string): Promise<UserResponse> {
    const user = await this.prismaService.pengguna.findUnique({
      where: {
        nim: nim,
      },
      select: {
        nim: true,
        email: true,
        status: true,
        namaLengkap: true,
        dibuatPada: true,
        prodi: true,
        angkatan: true,
        foto: true,
      },
    });

    if (!user) {
      throw new HttpException(
        {
          message: 'pengguna tidak ditemukan',
          path: ['nim'],
        },
        404,
      );
    }

    return user;
  }

  async delete(request: ReqDeletePengguna) {
    const users = await this.prismaService.pengguna.findMany({
      where: {
        nim: {
          in: request.selected,
        },
      },
    });

    if (users.length == 0 || users.length < request.selected.length) {
      throw new HttpException(
        {
          message: 'pengguna tidak ditemukan',
          path: ['selected'],
        },
        404,
      );
    }

    if (users.length > 0) {
      await Promise.all(
        users
          .filter((u) => u.foto)
          .map((u) =>
            fetch(`${process.env.SERVER}/api/photo/destroy`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                image_url: u.foto,
              }),
            }),
          ),
      );
    }

    const user = await this.prismaService.pengguna.deleteMany({
      where: {
        nim: {
          in: request.selected,
        },
      },
    });
    if (user.count == 0 || user.count < request.selected.length) {
      throw new HttpException(
        {
          message: 'pengguna tidak ditemukan',
          path: ['selected'],
        },
        404,
      );
    }

    await this.prismaService.alternatif.deleteMany({
      where: {
        nim: {
          in: request.selected,
        },
      },
    });

    return user;
  }

  async post(request: ReqPostPengguna) {
    const penggunaReq: ReqPostPengguna = this.validationService.validate(
      UserValidation.CREATE,
      request,
    ) as ReqPostPengguna;

    const statusMap: Record<string, StatusPengguna> = {
      Diterima: StatusPengguna.Diterima,
      Menunggu: StatusPengguna.Menunggu,
      Ditolak: StatusPengguna.Ditolak,
    };

    if (!statusMap[penggunaReq.status]) {
      throw new HttpException(
        {
          message: 'Status tidak valid',
          path: ['status'],
        },
        400,
      );
    }

    const isExistNim = await this.prismaService.pengguna.findUnique({
      where: {
        nim: penggunaReq.nim,
      },
    });

    if (isExistNim && isExistNim.nim) {
      throw new HttpException(
        {
          message: 'NIM sudah digunakan oleh pengguna lain',
          path: ['nim'],
        },
        400,
      );
    }
    const isExistEmail = await this.prismaService.pengguna.findFirst({
      where: {
        email: penggunaReq.email,
      },
    });

    if (isExistEmail && isExistEmail.email) {
      throw new HttpException(
        {
          message: 'Email sudah digunakan oleh pengguna lain',
          path: ['email'],
        },
        400,
      );
    }

    const salt = await bcrypt.genSalt();
    penggunaReq.kataSandi = await bcrypt.hash(penggunaReq.kataSandi, salt);

    const user = await this.prismaService.pengguna.create({
      data: {
        nim: penggunaReq.nim,
        email: penggunaReq.email,
        kataSandi: penggunaReq.kataSandi,
        namaLengkap: penggunaReq.namaLengkap,
        status: statusMap[penggunaReq.status],
        prodi: penggunaReq.prodi,
        angkatan: penggunaReq.angkatan,
        foto: penggunaReq.foto,
      },
    });

    return user;
  }

  async put(request: ReqPutPengguna, nim: string) {
    const penggunaReq: ReqPutPengguna = this.validationService.validate(
      UserValidation.PUT,
      request,
    ) as ReqPutPengguna;

    const statusMap: Record<string, StatusPengguna> = {
      Diterima: StatusPengguna.Diterima,
      Menunggu: StatusPengguna.Menunggu,
      Ditolak: StatusPengguna.Ditolak,
    };

    if (!statusMap[penggunaReq.status]) {
      throw new HttpException(
        {
          message: 'Status tidak valid',
          path: ['status'],
        },
        400,
      );
    }

    const isExist = await this.prismaService.pengguna.findUnique({
      where: {
        nim: nim,
      },
    });

    if (!isExist) {
      throw new HttpException('Pengguna tidak ditemukan', 404);
    }

    const isExistNim = await this.prismaService.pengguna.findFirst({
      where: {
        nim: penggunaReq.nim,
        NOT: {
          nim: nim,
        },
      },
    });

    if (isExistNim) {
      throw new HttpException(
        {
          message: 'NIM sudah digunakan oleh pengguna lain',
          path: ['nim'],
        },
        400,
      );
    }

    const isExistEmail = await this.prismaService.pengguna.findFirst({
      where: {
        email: penggunaReq.email,
        NOT: {
          nim: nim,
        },
      },
    });

    if (isExistEmail) {
      throw new HttpException(
        {
          message: 'Email sudah digunakan oleh pengguna lain',
          path: ['email'],
        },
        400,
      );
    }

    const user = await this.prismaService.pengguna.update({
      where: {
        nim: nim,
      },
      data: {
        nim: penggunaReq.nim,
        email: penggunaReq.email,
        namaLengkap: penggunaReq.namaLengkap,
        status: statusMap[penggunaReq.status],
        prodi: penggunaReq.prodi,
        angkatan: penggunaReq.angkatan,
        foto: penggunaReq.foto,
      },
    });

    if (penggunaReq.kataSandi) {
      const salt = await bcrypt.genSalt();
      penggunaReq.kataSandi = await bcrypt.hash(penggunaReq.kataSandi, salt);

      await this.prismaService.pengguna.update({
        where: {
          nim: user.nim,
        },
        data: {
          kataSandi: penggunaReq.kataSandi,
        },
      });
    }

    return user;
  }

  async status(request: { status: string }, nim: string) {
    const statusMap: Record<string, StatusPengguna> = {
      Diterima: StatusPengguna.Diterima,
      Menunggu: StatusPengguna.Menunggu,
      Ditolak: StatusPengguna.Ditolak,
    };

    if (!statusMap[request.status]) {
      throw new HttpException('Status tidak valid', 400);
    }

    const notFound = await this.prismaService.pengguna.findUnique({
      where: {
        nim: nim,
      },
    });

    if (!notFound) {
      throw new HttpException('Pengguna tidak ditemukan', 404);
    }

    const user = await this.prismaService.pengguna.update({
      where: {
        nim: nim,
      },
      data: {
        status: statusMap[request.status],
      },
    });
    return user;
  }
  // async editProfile(request: ReqEditUser, nim: string): Promise<UserResponse> {
  //   const RequestEdit: ReqEditUser = this.validationService.validate(
  //     UserValidation.EditProfie,
  //     request,
  //   ) as ReqEditUser;

  //   const user = await this.prismaService.pengguna.update({
  //     where: {
  //       nim: nim,
  //     },
  //     data: {
  //       namaLengkap: RequestEdit.namaLengkap,
  //       foto: RequestEdit.foto,
  //       email: RequestEdit.email,
  //     },
  //   });

  //   return {
  //     nim: user.nim,
  //     namaLengkap: user.namaLengkap,
  //     foto: user.foto,
  //     email: user.email,
  //   };
  // }
  // async changePassword(
  //   nim: string,
  //   request: ReqEditPassword,
  // ): Promise<UserResponse> {
  //   const EditRequest: ReqEditPassword = this.validationService.validate(
  //     UserValidation.ChangePassword,
  //     request,
  //   ) as ReqEditPassword;

  //   const user = await this.prismaService.pengguna.findUnique({
  //     where: {
  //       nim: nim,
  //     },
  //   });

  //   if (!user) {
  //     throw new HttpException(
  //       {
  //         message: 'pengguna tidak ditemukan',
  //         path: ['nim'],
  //       },
  //       404,
  //     );
  //   }

  //   const isPasswordValid = await bcrypt.compare(
  //     EditRequest.password,
  //     user.password,
  //   );

  //   if (!isPasswordValid) {
  //     throw new HttpException(
  //       {
  //         message: 'Kata sandi tidak valid',
  //         path: ['password'],
  //       },
  //       400,
  //     );
  //   }

  //   const gensalt = await bcrypt.genSalt(10);

  //   const hashedPassword = await bcrypt.hash(EditRequest.newPassword, gensalt);

  //   const updated = await this.prismaService.pengguna.update({
  //     where: {
  //       nim: nim,
  //     },
  //     data: {
  //       password: hashedPassword,
  //     },
  //   });

  //   return {
  //     nim: updated.nim,
  //     namaLengkap: updated.namaLengkap,
  //     foto: updated?.foto || null,
  //     email: updated.email,
  //   };
  // }
}
