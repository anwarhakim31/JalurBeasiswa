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
  ReqGetAllAlternativeValue,
} from '../models/alternative-value.model';

@Controller('/api/alternative')
export class AlternativeController {
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
    @Query('alternativeCode') alternativeCode?: string,
    @Query('kriteriaCode') kriteriaCode?: string,
  ): Promise<WebResponse<AlternativeValueResponse[]>> {
    const request: ReqGetAllAlternativeValue = {
      search: search || '',
      page: page,
      limit: limit,
      alternativeCode: alternativeCode || '',
      kriteriaCode: kriteriaCode || '',
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
    @Body() request: ReqPostAlternative,
  ): Promise<WebResponse<AlternativeValueResponse>> {
    const res = await this.alternativeValueService.create(request);

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
    @Body() request: ReqPutAlternative,
    @Param('code') code: string,
  ): Promise<WebResponse<AlternativeValueResponse>> {
    const res = await this.alternativeValueService.update(request, code);
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
  ): Promise<WebResponse<{ name: string }>> {
    await this.alternativeValueService.delete(request);
    return {
      success: true,
      message: 'Berhasil menghapus data beasiswa',
    };
  }
}
