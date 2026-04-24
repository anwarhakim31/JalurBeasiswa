import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AdminGuard } from '../guards/admin.guard';
import { AuthGuard } from '../guards/auth.guard';
import { WebResponse } from '../models/web.model';
import {
  ReqDeletePengguna,
  ReqEditPassword,
  ReqEditUser,
  ReqGetAllUser,
  ReqPostPengguna,
  ReqPutPengguna,
  UserResponse,
} from '../models/user.model';
import { AuthResponse } from '../models/auth.model';
import { User } from '../decorator/user.decorator';
import { Pengguna } from '@prisma/client';

@Controller('/api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard, AdminGuard)
  @HttpCode(200)
  @Get('/all')
  async getAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<WebResponse<UserResponse[]>> {
    const request: ReqGetAllUser = {
      search: search || '',
      page: page,
      limit: limit,
      status: status || '',
    };

    const result = await this.userService.getAll(request);

    return {
      message: 'Berhasil mengambil data penyakit',
      success: true,
      data: result.data,
      paging: result.paging,
    };
  }

  @UseGuards(AuthGuard, AdminGuard)
  @HttpCode(200)
  @Get('/select')
  async getForSelect(
    @Query('search') search?: string,
  ): Promise<WebResponse<{ value: string; label: string; id: string }[]>> {
    const request: ReqGetAllUser = {
      search: search || '',
      page: 1,
      limit: 100,
    };

    const result = await this.userService.getForSelect(request);

    return {
      message: 'Berhasil mengambil data penyakit',
      success: true,
      data: result.data.map((item) => ({
        value: item.nim,
        label: item.fullname.toString(),
        id: item.nim,
      })),
    };
  }

  @UseGuards(AuthGuard, AdminGuard)
  @HttpCode(200)
  @Get('/:nim/detail')
  async getByNIM(@Param('nim') nim: string): Promise<
    WebResponse<{
      nim: string;
      fullname: string;
      email: string;
      photo: string;
      status: string;
      createdAt: Date;
    }>
  > {
    const result = await this.userService.getByNIM(nim);

    return {
      data: result as Pengguna,
      success: true,
      message: 'Berhasil mendapatkan data pengguna',
    };
  }

  @Delete('/delete')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async Delete(
    @Body() request: ReqDeletePengguna,
  ): Promise<WebResponse<{ name: string }>> {
    await this.userService.delete(request);

    return {
      success: true,
      message: 'Berhasil menghapus data pengguna',
    };
  }

  @Post('/create')
  @HttpCode(201)
  @UseGuards(AuthGuard, AdminGuard)
  async Post(
    @Body() request: ReqPostPengguna,
  ): Promise<WebResponse<{ name: string }>> {
    await this.userService.post(request);

    return {
      success: true,
      message: 'Berhasil menambahkan data pengguna',
    };
  }

  @Put('/update')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async Put(
    @Body() request: ReqPutPengguna,
  ): Promise<WebResponse<{ name: string }>> {
    await this.userService.put(request);

    return {
      success: true,
      message: 'Berhasil mengubah  data pengguna',
    };
  }

  @Patch('/:nim/status')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async PutStatus(
    @Param('nim') nim: string,
    @Body() request: ReqPutPengguna,
  ): Promise<WebResponse<{ name: string }>> {
    await this.userService.status(request, nim);

    return {
      success: true,
      message: 'Berhasil mengubah  status pengguna',
    };
  }

  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Patch('/profile')
  async editProfile(
    @Body() request: ReqEditUser,
    @User() user: AuthResponse,
  ): Promise<UserResponse> {
    return this.userService.editProfile(request, user.nim);
  }

  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Patch('/password')
  async changePassword(
    @Body() request: ReqEditPassword,
    @User() user: AuthResponse,
  ): Promise<UserResponse> {
    return this.userService.changePassword(user.nim, request);
  }
}
