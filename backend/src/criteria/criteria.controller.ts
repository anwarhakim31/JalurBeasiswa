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
import { CriteriaService } from './criteria.service';
import { AuthGuard } from '../guards/auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import {
  CriteriaResponse,
  ReqDeleteCriteria,
  ReqGetAllCriteria,
  ReqPostCriteria,
  ReqPutCriteria,
} from '../models/criteria.model';
import { WebResponse } from '../models/web.model';

@Controller('/api/criteria')
export class CriteriaController {
  constructor(private readonly criteriaService: CriteriaService) {}

  @Get('/all')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async getAll(
    @Query('search') search?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('tipe') tipe?: string,
    @Query('kodeBeasiswa') kodeBeasiswa?: string,
  ): Promise<WebResponse<CriteriaResponse[]>> {
    const request: ReqGetAllCriteria = {
      search: search || '',
      page: page,
      limit: limit,
      tipe: tipe || '',
      kodeBeasiswa: kodeBeasiswa || '',
    };

    const res = await this.criteriaService.getAll(request);

    return {
      success: true,
      message: 'Berhasil mengambil data kriteria',
      data: res.data,
      paging: res.paging,
    };
  }

  @Get('/select')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async select(
    @Query('kodeBeasiswa') kodeBeasiswa?: string,
    @Query('search') search?: string,
  ): Promise<WebResponse<{ id: string; label: string; value: string }[]>> {
    const res = await this.criteriaService.select(kodeBeasiswa, search);

    return {
      success: true,
      message: 'Berhasil mengambil data kriteria',
      data: res.map((item) => {
        return {
          id: item.kode,
          label: item.nama,
          value: item.kode,
        };
      }),
    };
  }

  @Get('/:kodeBeasiswa/get')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async getByBeasiswaCode(
    @Param('kodeBeasiswa') kodeBeasiswa: string,
  ): Promise<WebResponse<CriteriaResponse[]>> {
    const res = await this.criteriaService.getByBeasiswaCode(kodeBeasiswa);

    return {
      success: true,
      message: 'Berhasil mengambil data kriteria',
      data: res,
    };
  }

  @Post('/create')
  @HttpCode(201)
  @UseGuards(AuthGuard, AdminGuard)
  async create(
    @Body() request: ReqPostCriteria,
  ): Promise<WebResponse<CriteriaResponse>> {
    const res = await this.criteriaService.create(request);

    return {
      success: true,
      message: 'Berhasil menambahkan data kriteria',
      data: res,
    };
  }

  @Put('/:kode/update')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async update(
    @Body() request: ReqPutCriteria,
    @Param('kode') kode: string,
  ): Promise<WebResponse<CriteriaResponse>> {
    const res = await this.criteriaService.put(request, kode);
    return {
      success: true,
      message: 'Berhasil mengubah data kriteria',
      data: res,
    };
  }

  @Delete('/delete')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async delete(
    @Body() request: ReqDeleteCriteria,
  ): Promise<WebResponse<{ name: string }>> {
    await this.criteriaService.delete(request);
    return {
      success: true,
      message: 'Berhasil menghapus data kriteria',
    };
  }

  @Patch('/:kode/type')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async changeType(
    @Param('kode') kode: string,
    @Body() request: { tipe: string },
  ): Promise<WebResponse<{ nama: string }>> {
    const res = await this.criteriaService.changeType(request, kode);

    return {
      success: true,
      message: 'Berhasil mengubah tipe kriteria',
      data: res,
    };
  }
}
