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
    @Query('type') type?: string,
  ): Promise<WebResponse<CriteriaResponse[]>> {
    const request: ReqGetAllCriteria = {
      search: search || '',
      page: page,
      limit: limit,
      type: type || '',
    };

    const res = await this.criteriaService.getAll(request);

    return {
      success: true,
      message: 'Berhasil mengambil data kriteria',
      data: res.data,
      paging: res.paging,
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

  @Put('/:code/update')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async update(
    @Body() request: ReqPutCriteria,
    @Param('code') code: string,
  ): Promise<WebResponse<CriteriaResponse>> {
    const res = await this.criteriaService.put(request, code);
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
      message: 'Berhasil menghapus data beasiswa',
    };
  }
}
