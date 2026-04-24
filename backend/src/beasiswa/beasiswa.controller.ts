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
        id: item.id,
        label: item.name,
        value: item.id,
      })),
    };
  }

  @Post('/create')
  @HttpCode(201)
  @UseGuards(AuthGuard, AdminGuard)
  async create(
    @Body() request: ReqPostBeasiswa,
  ): Promise<WebResponse<{ name: string }>> {
    const res = await this.beasiswaService.create(request);

    return {
      success: true,
      message: 'Berhasil menambahkan data beasiswa',
      data: res,
    };
  }

  @Put('/:id/update')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async update(
    @Body() request: ReqPutBeasiswa,
    @Param('id') id: string,
  ): Promise<WebResponse<{ name: string }>> {
    const res = await this.beasiswaService.update(request, id);
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
  ): Promise<WebResponse<{ name: string }>> {
    await this.beasiswaService.delete(request);
    return {
      success: true,
      message: 'Berhasil menghapus data beasiswa',
    };
  }

  @Patch('/:id/status')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async changeStatus(
    @Param('id') id: string,
    @Body() request: { isActive: boolean },
  ): Promise<WebResponse<{ name: string }>> {
    console.log(request);
    const res = await this.beasiswaService.changeStatus(request, id);

    return {
      success: true,
      message: 'Berhasil mengubah status beasiswa',
      data: res,
    };
  }
}
