import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ProcessValuesService } from './process-values.service';
import { AuthGuard } from '../guards/auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { Response } from 'express';

@Controller('/api/process-values')
export class ProcessValuesController {
  constructor(private readonly processValuesService: ProcessValuesService) {}

  @Get('/:kodeBeasiswa/step')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async DataAlternativeByKriteria(
    @Res() res: Response,
    @Param('kodeBeasiswa') kodeBeasiswa: string,
    @Query('search') search?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
  ): Promise<void> {
    const data = await this.processValuesService.step(
      kodeBeasiswa,
      search,
      page || 1,
    );

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data alternatif berdasarkan kriteria',
      data: data,
    });
  }

  @Get('/:kodeBeasiswa/ranking')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async ranking(
    @Res() res: Response,
    @Param('kodeBeasiswa') kodeBeasiswa: string,
    @Query('search') search?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
  ): Promise<void> {
    const data = await this.processValuesService.ranking(
      kodeBeasiswa,
      search,
      page || 1,
    );

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data ranking',
      data: data,
    });
  }

  @Patch('/change-status')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async status(
    @Res() res: Response,
    @Body()
    request: {
      selected: string[];
      status: 'Disetujui' | 'Ditolak' | 'Diproses';
    },
  ): Promise<void> {
    const result = await this.processValuesService.changeStatus(request);

    res.json({
      success: true,
      message: 'Berhasil mengubah status',
      data: result,
    });
  }
}
