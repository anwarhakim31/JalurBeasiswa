import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import {
  AuthResponse,
  ForgetRequest,
  LoginRequest,
  RegisterRequest,
} from '../models/auth.model';
import { JwtPayload } from '../models/payload.model';
import { Response } from 'express';
import { AuthGuard } from '../guards/auth.guard';
import { User } from '../decorator/user.decorator';

const { MODE, DOMAIN } = process.env;

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private JwtService: JwtService,
  ) {}

  @Post('/register')
  @HttpCode(201)
  async register(
    @Body() request: RegisterRequest,
    @Res() response: Response,
  ): Promise<void> {
    await this.authService.register(request);

    response.json({
      success: true,
      message:
        'Berhasil mendaftar. Akun Anda sedang dalam proses verifikasi. Mohon tunggu hingga maksimal 1x24 jam.',
    });
  }

  @Post('/login')
  @HttpCode(200)
  async login(@Body() request: LoginRequest, @Res() response: Response) {
    const result = await this.authService.login(request);

    const token = this.JwtService.sign(result as JwtPayload);

    response.cookie('token-jalurbeasiswa', token, {
      httpOnly: true,
      secure: MODE === 'production' ? true : false,
      sameSite: MODE === 'production' ? 'none' : 'lax',
      maxAge: 8 * 60 * 60 * 1000,
      domain: DOMAIN,
    });

    response.json({
      success: true,
      message: 'Berhasil masuk sistem',
      data: {
        ...result,
        token: token,
      },
    });
  }

  @Patch('/forgot-password')
  @HttpCode(200)
  async forget(@Body() request: ForgetRequest, @Res() response: Response) {
    const result = await this.authService.forget(request);
    response.json({
      success: true,
      message: 'Berhasil mengubah kata sandi',
      data: result,
    });
  }

  @Get('/current-user')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async currentUser(
    @Req() @User() user: AuthResponse,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.authService.get(user.nim);
    response.json({
      success: true,
      message: 'Berhasil mendapatkan data pengguna',
      data: result,
    });
  }

  @Delete('/logout')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async delete(@Res() res: Response): Promise<void> {
    res.clearCookie('token-jalurbeasiswa', { domain: process.env.DOMAIN });

    res.json({
      success: true,
      message: 'Berhasil keluar sistem',
    });
  }
}
