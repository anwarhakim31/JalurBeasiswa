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
    @Query('beasiswaCode') beasiswaCode?: string,
  ): Promise<WebResponse<AlternativeResponse[]>> {
    const request: ReqGetAllAlternative = {
      search: search || '',
      page: page,
      limit: limit,
      beasiswaCode: beasiswaCode || '',
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
        alternativeCode: string;
        alternativeName: string;
        beasiswaCode: string;
        beasiswaName: string;
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
        alternativeCode: item.code,
        alternativeName: item.fullname,
        beasiswaCode: item.beasiswaCode,
        beasiswaName: item.name,
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

  @Put('/:code/update')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async update(
    @Body() request: ReqPutAlternative,
    @Param('code') code: string,
  ): Promise<WebResponse<AlternativeResponse>> {
    const res = await this.alternativeService.update(request, code);
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
    await this.alternativeService.delete(request);
    return {
      success: true,
      message: 'Berhasil menghapus data beasiswa',
    };
  }
}
