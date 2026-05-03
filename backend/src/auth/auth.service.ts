import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  AuthResponse,
  ForgetRequest,
  LoginRequest,
  RegisterRequest,
} from '../models/auth.model';
import { AuthValidation } from './auth.validation';
import { ValidationService } from '../common/validation.service';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async register(request: RegisterRequest): Promise<AuthResponse> {
    const registerRequest = this.validationService.validate(
      AuthValidation.REGISTER,
      request,
    ) as RegisterRequest;

    const userExits = await this.prismaService.pengguna.findFirst({
      where: {
        OR: [{ email: registerRequest.email }, { nim: registerRequest.nim }],
      },
    });

    if (userExits && userExits.status === 'Diterima') {
      throw new HttpException('NIM atau email sudah digunakan', 400);
    }

    if (userExits && userExits.status === 'Menunggu') {
      throw new HttpException(
        'Akun Anda sedang dalam proses verifikasi. Silakan tunggu hingga proses selesai.',
        400,
      );
    }

    if (userExits && userExits.status === 'Ditolak') {
      throw new HttpException(
        'Pendaftaran Anda ditolak. Silakan periksa kembali data yang dimasukkan.',
        400,
      );
    }

    registerRequest.kataSandi = await bcrypt.hash(
      registerRequest.kataSandi,
      10,
    );

    const user = await this.prismaService.pengguna.create({
      data: registerRequest,
    });

    return {
      nim: user.nim,
      email: user.email,
      admin: user.admin,
    };
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    const loginRequest = this.validationService.validate(
      AuthValidation.LOGIN,
      request,
    ) as LoginRequest;

    const user = await this.prismaService.pengguna.findFirst({
      where: {
        OR: [
          { email: loginRequest['nim/email'] },
          { nim: loginRequest['nim/email'] },
        ],
      },
    });

    if (!user) {
      throw new HttpException('Nama pengguna atau kata sandi salah', 401);
    }

    if (user.status === 'Menunggu') {
      throw new HttpException(
        'Akun Anda sedang dalam proses verifikasi. Silakan tunggu hingga proses selesai.',
        400,
      );
    }

    if (user.status === 'Ditolak') {
      throw new HttpException(
        'Pendaftaran Anda ditolak. Silakan periksa kembali data yang dimasukkan.',
        400,
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginRequest.kataSandi,
      user.kataSandi,
    );

    if (!isPasswordValid) {
      throw new HttpException('Nama pengguna atau kata sandi salah', 401);
    }

    return {
      nim: user.nim,
      namaLengkap: user.namaLengkap,
      email: user.email,
      admin: user.admin,
      foto: user.foto,
    };
  }

  async forget(request: ForgetRequest): Promise<AuthResponse> {
    const forgetRequest = this.validationService.validate(
      AuthValidation.FORGET,
      request,
    ) as ForgetRequest;

    const user = await this.prismaService.pengguna.findFirst({
      where: {
        AND: [{ email: forgetRequest.email }, { nim: forgetRequest.nim }],
      },
    });

    if (!user) {
      throw new HttpException('Pengguna tidak ditemukan', 401);
    }

    if (user.status === 'Menunggu') {
      throw new HttpException(
        'Akun Anda sedang dalam proses verifikasi. Silakan tunggu hingga proses selesai.',
        400,
      );
    }

    if (user.status === 'Ditolak') {
      throw new HttpException(
        'Pendaftaran Anda ditolak. Silakan periksa kembali data yang dimasukkan.',
        400,
      );
    }

    forgetRequest.kataSandiBaru = await bcrypt.hash(
      forgetRequest.kataSandiBaru,
      10,
    );

    await this.prismaService.pengguna.update({
      where: {
        nim: user.nim,
      },
      data: {
        kataSandi: forgetRequest.kataSandiBaru,
      },
    });

    return {
      nim: user.nim,
      namaLengkap: user.namaLengkap,
      email: user.email,
      admin: user.admin,
    };
  }

  async get(nim: string): Promise<AuthResponse> {
    const user = await this.prismaService.pengguna.findFirst({
      where: {
        nim: nim,
      },
    });

    if (!user) {
      throw new HttpException('Pengguna tidak ditemukan', 401);
    }

    return {
      nim: user.nim,
      namaLengkap: user.namaLengkap,
      email: user.email,
      admin: user.admin,
      foto: user.foto,
    };
  }
}
