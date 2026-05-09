import { Controller, Get, HttpCode, Res, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../guards/auth.guard';
import { Response } from 'express';

@Controller('/api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async dashboard(@Res() res: Response): Promise<void> {
    const result = await this.dashboardService.dashboard();
    res.json({
      data: result,
      success: true,
      message: 'Berhasil mendapatkan data dashboard',
    });
  }
}
