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
import { AlternativeValueService } from './alternative-value.service';
import { WebResponse } from '../models/web.model';
import { AdminGuard } from '../guards/admin.guard';
import { AuthGuard } from '../guards/auth.guard';
import {
  AlternativeValueResponse,
  ReqDeleteAlternativeValue,
  ReqGetAllAlternativeValue,
  ReqPostAlternativeValue,
  ReqPutAlternativeValue,
} from '../models/alternative-value.model';

@Controller('/api/alternative-value')
export class AlternativeValueController {
  constructor(
    private readonly alternativeValueService: AlternativeValueService,
  ) {}

  @Get('/all')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async getAll(
    @Query('search') search?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('kodeAlternatif') kodeAlternatif?: string,
    @Query('kodeKriteria') kodeKriteria?: string,
  ): Promise<WebResponse<AlternativeValueResponse[]>> {
    const request: ReqGetAllAlternativeValue = {
      search: search || '',
      page: page,
      limit: limit,
      kodeAlternatif: kodeAlternatif || '',
      kodeKriteria: kodeKriteria || '',
    };
    const res = await this.alternativeValueService.GetAll(request);

    return {
      success: true,
      message: 'Berhasil mengambil data alternatif',
      data: res.data,
      paging: res.paging,
    };
  }

  @Post('/create')
  @HttpCode(201)
  @UseGuards(AuthGuard, AdminGuard)
  async create(
    @Body() request: ReqPostAlternativeValue,
  ): Promise<WebResponse<AlternativeValueResponse[]>> {
    const res = await this.alternativeValueService.create(request);

    return {
      success: true,
      message: 'Berhasil menambahkan data beasiswa',
      data: res,
    };
  }

  @Get('/:kodeAlternatif/detail')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async getDetail(@Param('kodeAlternatif') kodeAlternatif: string): Promise<
    WebResponse<{
      kodeAlternatif: string;
      kodeBeasiswa: string;
      nilaiAlternatif: {
        kodeKriteria: string;
        namaKriteria: string;
        nilai: number;
      }[];
    }>
  > {
    const res = await this.alternativeValueService.getDetail(kodeAlternatif);

    return {
      success: true,
      message: 'Berhasil menambahkan data beasiswa',
      data: res,
    };
  }

  @Put('/update')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async update(
    @Body() request: ReqPutAlternativeValue,
  ): Promise<WebResponse<AlternativeValueResponse[]>> {
    const res = await this.alternativeValueService.update(request);

    return {
      success: true,
      message: 'Berhasil menambahkan data beasiswa',
      data: res,
    };
  }

  @Delete('/delete')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async delete(
    @Body() request: ReqDeleteAlternativeValue,
  ): Promise<WebResponse<{ nama: string }>> {
    await this.alternativeValueService.delete(request);
    return {
      success: true,
      message: 'Berhasil menghapus data beasiswa',
    };
  }
}
