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
  @Get('/:kode/detail')
  async getByCode(
    @Param('kode') kode: string,
  ): Promise<WebResponse<BeasiswaResponse>> {
    const result = await this.beasiswaService.getByCode(kode);

    return {
      data: result,
      success: true,
      message: 'Berhasil mendapatkan data beasiswa',
    };
  }

  @UseGuards(AuthGuard, AdminGuard)
  @HttpCode(200)
  @Patch('/:kodeBeasiswa/publish')
  async publish(
    @Param('kodeBeasiswa') kode: string,
  ): Promise<WebResponse<BeasiswaResponse>> {
    const result = await this.beasiswaService.publish(kode);

    return {
      data: result,
      success: true,
      message: 'Berhasil mengubah nilai publikasi beasiswa',
    };
  }

  @UseGuards(AuthGuard, AdminGuard)
  @HttpCode(200)
  @Get('/:kode/alternative')
  async getByAlternativeCode(
    @Param('kode') kode: string,
  ): Promise<WebResponse<BeasiswaResponse>> {
    const result = await this.beasiswaService.getByCode(kode);

    return {
      data: result,
      success: true,
      message: 'Berhasil mendapatkan data beasiswa',
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
        id: item.kode,
        label: item.nama,
        value: item.kode,
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

  @Put('/:kode/update')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async update(
    @Body() request: ReqPutBeasiswa,
    @Param('kode') kode: string,
  ): Promise<WebResponse<BeasiswaResponse>> {
    const res = await this.beasiswaService.update(request, kode);
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

  @Patch('/:kode/status')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async changeStatus(
    @Param('kode') kode: string,
    @Body() request: { status: boolean },
  ): Promise<WebResponse<{ nama: string }>> {
    const res = await this.beasiswaService.changeStatus(request, kode);

    return {
      success: true,
      message: 'Berhasil mengubah status beasiswa',
      data: res,
    };
  }
}
