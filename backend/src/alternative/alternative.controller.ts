import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AlternativeService } from './alternative.service';
import { WebResponse } from '../models/web.model';
import { AdminGuard } from '../guards/admin.guard';
import { AuthGuard } from '../guards/auth.guard';
import {
  AlternativeResponse,
  ReqDeleteAlternative,
  ReqGetAllAlternative,
  ReqPostAlternative,
  ReqPutAlternative,
} from '../models/alternative.model';

@Controller('/api/alternative')
export class AlternativeController {
  constructor(private readonly alternativeService: AlternativeService) {}

  @Get('/all')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async getAll(
    @Query('search') search?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('kodeBeasiswa') kodeBeasiswa?: string,
  ): Promise<WebResponse<AlternativeResponse[]>> {
    const request: ReqGetAllAlternative = {
      search: search || '',
      page: page,
      limit: limit,
      kodeBeasiswa: kodeBeasiswa || '',
    };
    const res = await this.alternativeService.GetAll(request);

    return {
      success: true,
      message: 'Berhasil mengambil data alternatif',
      data: res.data,
      paging: res.paging,
    };
  }

  @Get('/select')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async getForSelect(@Query('search') search?: string): Promise<
    WebResponse<
      {
        kodeAlternatif: string;
        namaAlternatif: string;
        kodeBeasiswa: string;
        namaBeasiswa: string;
      }[]
    >
  > {
    const request: ReqGetAllAlternative = {
      search: search || '',
      page: 1,
      limit: 100,
    };

    const res = await this.alternativeService.getForSelect(request);

    return {
      success: true,
      message: 'Berhasil mengambil data alternatif',
      data: res.map((item) => ({
        kodeAlternatif: item.kode,
        namaAlternatif: item.namaLengkap,
        kodeBeasiswa: item.kodeBeasiswa,
        namaBeasiswa: item.nama,
      })),
    };
  }

  @Post('/create')
  @HttpCode(201)
  @UseGuards(AuthGuard, AdminGuard)
  async create(
    @Body() request: ReqPostAlternative,
  ): Promise<WebResponse<AlternativeResponse>> {
    const res = await this.alternativeService.create(request);

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
    @Body() request: ReqPutAlternative,
    @Param('kode') kode: string,
  ): Promise<WebResponse<AlternativeResponse>> {
    const res = await this.alternativeService.update(request, kode);
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
    @Body() request: ReqDeleteAlternative,
  ): Promise<WebResponse<{ nama: string }>> {
    await this.alternativeService.delete(request);
    return {
      success: true,
      message: 'Berhasil menghapus data beasiswa',
    };
  }
}
