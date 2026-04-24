import { HttpException, Injectable } from '@nestjs/common';
import {
  ReqDeletePengguna,
  ReqEditPassword,
  ReqEditUser,
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
import { UserStatus } from '@prisma/client';

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
            fullname: {
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
        isAdmin: false,
      },
      skip: (getReq.page - 1) * getReq.limit,
      take: getReq.limit,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        nim: true,
        email: true,
        status: true,
        fullname: true,
        createdAt: true,
        prodi: true,
        batch: true,
        photo: true,
      },
    });

    const total = await this.prismaService.pengguna.count({
      where: {
        AND: filter,
        isAdmin: false,
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
            fullname: {
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
        fullname: {
          not: null,
        },
        prodi: {
          not: null,
        },
        batch: {
          not: null,
        },
        isAdmin: false,
        status: UserStatus.ACCEPT,
      },
      skip: (getReq.page - 1) * getReq.limit,
      take: getReq.limit,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        nim: true,
        fullname: true,
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
        fullname: true,
        createdAt: true,
        prodi: true,
        batch: true,
        photo: true,
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

    const statusMap: Record<string, UserStatus> = {
      ACCEPT: UserStatus.ACCEPT,
      PENDING: UserStatus.PENDING,
      REJECTED: UserStatus.REJECTED,
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
          message: 'NIM sudah digunakan',
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
          message: 'Email sudah digunakan',
          path: ['email'],
        },
        400,
      );
    }

    const salt = await bcrypt.genSalt();
    penggunaReq.password = await bcrypt.hash(penggunaReq.password, salt);

    const user = await this.prismaService.pengguna.create({
      data: {
        nim: penggunaReq.nim,
        email: penggunaReq.email,
        password: penggunaReq.password,
        fullname: penggunaReq.fullname,
        status: statusMap[penggunaReq.status],
        prodi: penggunaReq.prodi,
        batch: penggunaReq.batch,
        photo: penggunaReq.photo,
      },
    });

    return user;
  }

  async put(request: ReqPutPengguna) {
    const penggunaReq: ReqPutPengguna = this.validationService.validate(
      UserValidation.PUT,
      request,
    ) as ReqPutPengguna;

    const statusMap: Record<string, UserStatus> = {
      ACCEPT: UserStatus.ACCEPT,
      PENDING: UserStatus.PENDING,
      REJECTED: UserStatus.REJECTED,
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

    const isExist = await this.prismaService.pengguna.findFirst({
      where: {
        OR: [
          {
            email: penggunaReq.email,
          },
          {
            nim: penggunaReq.nim,
          },
        ],
      },
    });

    if (!isExist) {
      throw new HttpException('Pengguna tidak ditemukan', 404);
    }

    const isExistNim = await this.prismaService.pengguna.findFirst({
      where: {
        nim: penggunaReq.nim,
        NOT: {
          nim: penggunaReq.nim,
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
          nim: penggunaReq.nim,
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
        nim: penggunaReq.nim,
      },
      data: {
        nim: penggunaReq.nim,
        email: penggunaReq.email,
        fullname: penggunaReq.fullname,
        status: statusMap[penggunaReq.status],
        prodi: penggunaReq.prodi,
        batch: penggunaReq.batch,
        photo: penggunaReq.photo,
      },
    });

    if (penggunaReq.password) {
      const salt = await bcrypt.genSalt();
      penggunaReq.password = await bcrypt.hash(penggunaReq.password, salt);

      await this.prismaService.pengguna.update({
        where: {
          nim: penggunaReq.nim,
        },
        data: {
          password: penggunaReq.password,
        },
      });
    }

    return user;
  }

  async status(request: { status: string }, nim: string) {
    const statusMap: Record<string, UserStatus> = {
      ACCEPT: UserStatus.ACCEPT,
      PENDING: UserStatus.PENDING,
      REJECTED: UserStatus.REJECTED,
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
  async editProfile(request: ReqEditUser, nim: string): Promise<UserResponse> {
    const RequestEdit: ReqEditUser = this.validationService.validate(
      UserValidation.EditProfie,
      request,
    ) as ReqEditUser;

    const user = await this.prismaService.pengguna.update({
      where: {
        nim: nim,
      },
      data: {
        fullname: RequestEdit.fullname,
        photo: RequestEdit.photo,
        email: RequestEdit.email,
      },
    });

    return {
      nim: user.nim,
      fullname: user.fullname,
      photo: user.photo,
      email: user.email,
    };
  }
  async changePassword(
    nim: string,
    request: ReqEditPassword,
  ): Promise<UserResponse> {
    const EditRequest: ReqEditPassword = this.validationService.validate(
      UserValidation.ChangePassword,
      request,
    ) as ReqEditPassword;

    const user = await this.prismaService.pengguna.findUnique({
      where: {
        nim: nim,
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

    const isPasswordValid = await bcrypt.compare(
      EditRequest.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpException(
        {
          message: 'Kata sandi tidak valid',
          path: ['password'],
        },
        400,
      );
    }

    const gensalt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(EditRequest.newPassword, gensalt);

    const updated = await this.prismaService.pengguna.update({
      where: {
        nim: nim,
      },
      data: {
        password: hashedPassword,
      },
    });

    return {
      nim: updated.nim,
      fullname: updated.fullname,
      photo: updated?.photo || null,
      email: updated.email,
    };
  }
}
