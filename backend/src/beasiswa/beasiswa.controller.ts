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
import { BeasiswaService } from './beasiswa.service';
import {
  BeasiswaResponse,
  ReqDeleteBeasiswa,
  ReqGetAllBeasiswa,
  ReqPostBeasiswa,
  ReqPutBeasiswa,
} from '../models/beasiswa.model';
import { WebResponse } from '../models/web.model';
import { AdminGuard } from '../guards/admin.guard';
import { AuthGuard } from '../guards/auth.guard';

@Controller('/api/beasiswa')
export class BeasiswaController {
  constructor(private readonly beasiswaService: BeasiswaService) {}

  @Get('/all')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async getAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<WebResponse<BeasiswaResponse[]>> {
    const request: ReqGetAllBeasiswa = {
      search: search || '',
      page: page,
      limit: limit,
      status: status || '',
    };

    const res = await this.beasiswaService.GetAll(request);

    return {
      success: true,
      message: 'Berhasil mengambil data beasiswa',
      data: res.data,
      paging: res.paging,
    };
  }

  @UseGuards(AuthGuard, AdminGuard)
  @HttpCode(200)
  @Get('/:code/detail')
  async getByCode(
    @Param('code') code: string,
  ): Promise<WebResponse<BeasiswaResponse>> {
    const result = await this.beasiswaService.getByCode(code);

    return {
      data: result,
      success: true,
      message: 'Berhasil mendapatkan data pengguna',
    };
  }

  @Get('/select')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async getForSelect(
    @Query('search') search?: string,
  ): Promise<WebResponse<{ id: string; label: string; value: string }[]>> {
    const request: ReqGetAllBeasiswa = {
      search: search || '',
      page: 1,
      limit: 100,
    };

    const res = await this.beasiswaService.getForSelect(request);

    return {
      success: true,
      message: 'Berhasil mengambil data beasiswa',
      data: res.data.map((item) => ({
        id: item.code,
        label: item.name,
        value: item.code,
      })),
    };
  }

  @Post('/create')
  @HttpCode(201)
  @UseGuards(AuthGuard, AdminGuard)
  async create(
    @Body() request: ReqPostBeasiswa,
  ): Promise<WebResponse<BeasiswaResponse>> {
    const res = await this.beasiswaService.create(request);

    return {
      success: true,
      message: 'Berhasil menambahkan data beasiswa',
      data: res,
    };
  }

  @Put('/:code/update')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async update(
    @Body() request: ReqPutBeasiswa,
    @Param('code') code: string,
  ): Promise<WebResponse<BeasiswaResponse>> {
    const res = await this.beasiswaService.update(request, code);
    return {
      success: true,
      message: 'Berhasil mengubah data beasiswa',
      data: res,
    };
  }

  @Delete('/delete')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async delete(
    @Body() request: ReqDeleteBeasiswa,
  ): Promise<WebResponse<BeasiswaResponse>> {
    await this.beasiswaService.delete(request);
    return {
      success: true,
      message: 'Berhasil menghapus data beasiswa',
    };
  }

  @Patch('/:code/status')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async changeStatus(
    @Param('code') code: string,
    @Body() request: { isActive: boolean },
  ): Promise<WebResponse<{ name: string }>> {
    const res = await this.beasiswaService.changeStatus(request, code);

    return {
      success: true,
      message: 'Berhasil mengubah status beasiswa',
      data: res,
    };
  }
}
