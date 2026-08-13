import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Res,
  UseGuards,
} from '@nestjs/common';
import { MasterDataService } from './master-data.service';
import { AuthGuard } from '../guards/auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { Response } from 'express';
import {
  MasterDataResponse,
  ReqBasicInformation,
  ReqcontactService,
} from '../models/master-data.model';
import { WebResponse } from '../models/web.model';

@Controller('/api/master-data')
export class MasterDataController {
  constructor(private readonly masterDataService: MasterDataService) {}

  @Get('/all')
  @HttpCode(200)
  async getMasterData(@Res() res: Response): Promise<void> {
    const result = await this.masterDataService.getMasterData();
    res.json(result);
  }

  @Patch('/upload-document')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async toggleUploadDocument(@Res() res: Response): Promise<void> {
    const result = await this.masterDataService.toggleUploadDocument();
    res.json({
      success: true,
      message: 'Berhasil mengubah fitur unggah berkas',
      data: result,
    });
  }

  @Patch('/registration')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async toggleRegistration(@Res() res: Response): Promise<void> {
    const result = await this.masterDataService.toggleRegistration();

    res.json({
      success: true,
      message: 'Berhasil mengubah fitur pendaftaran',
      data: result,
    });
  }

  @Patch('/maintenance-mode')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async toggleMaintenance(@Res() res: Response): Promise<void> {
    const result = await this.masterDataService.toggleMaintenance();

    res.json({
      success: true,
      message: 'Berhasil mengubah fitur mode pemeliharaan',
      data: result,
    });
  }

  @Delete('/reset-all-data')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async deleteAllData(@Res() res: Response): Promise<void> {
    await this.masterDataService.ResetAllData();
    res.json({
      success: true,
      message: 'Berhasil menghapus semua data',
    });
  }

  @Delete('/reset-user-data')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async deleteUserData(@Res() res: Response): Promise<void> {
    await this.masterDataService.ResetUserData();
    res.json({
      success: true,
      message: 'Berhasil menghapus semua data pengguna',
    });
  }

  @Delete('/reset-beasiswa-data')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async deleteBeasiswaData(@Res() res: Response): Promise<void> {
    await this.masterDataService.ResetBeasiswaData();
    res.json({
      success: true,
      message: 'Berhasil menghapus semua data beasiswa',
    });
  }

  @Delete('/reset-criteria-data')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async deleteKriteriaData(@Res() res: Response): Promise<void> {
    await this.masterDataService.ResetCriteriaData();
    res.json({
      success: true,
      message: 'Berhasil menghapus semua data kriteria',
    });
  }
  @Delete('/reset-alternative-data')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async deleteAlternativeData(@Res() res: Response): Promise<void> {
    await this.masterDataService.ResetAlternatifDAta();
    res.json({
      success: true,
      message: 'Berhasil menghapus semua data alternatif',
    });
  }

  @Delete('/reset-alternative-value-data')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async deleteAlternativeValueData(@Res() res: Response): Promise<void> {
    await this.masterDataService.ResetNilaiData();
    res.json({
      success: true,
      message: 'Berhasil menghapus semua data nilai alternatif',
    });
  }

  @Patch('/main-logo')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async MainLogo(
    @Body() request: { logoUtama: string },
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.masterDataService.MainLogo(request);
    res.json({
      success: true,
      message: 'Berhasil mengubah logo utama',
      data: result,
    });
  }

  @Patch('/secondary-logo')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async SecondaryLogo(
    @Body() request: { logoKedua: string },
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.masterDataService.SecondaryLogo(request);
    res.json({
      success: true,
      message: 'Berhasil mengubah logo kedua',
      data: result,
    });
  }

  @Patch('/favicon')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async Favicon(
    @Body() request: { favicon: string },
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.masterDataService.Favicon(request);
    res.json({
      success: true,
      message: 'Berhasil mengubah favicon',
      data: result,
    });
  }

  @Delete('/main-logo')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async DeleteMainLogo(@Res() res: Response): Promise<void> {
    const result = await this.masterDataService.DeleteMainLogo();
    res.json({
      success: true,
      message: 'Berhasil menghapus logo utama',
      data: result,
    });
  }

  @Delete('/secondary-logo')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async DeleteSecondaryLogo(@Res() res: Response): Promise<void> {
    const result = await this.masterDataService.DeleteSecondaryLogo();
    res.json({
      success: true,
      message: 'Berhasil menghapus logo kedua',
      data: result,
    });
  }

  @Delete('/favicon')
  @HttpCode(200)
  @UseGuards(AuthGuard, AdminGuard)
  async DeleteFavicon(@Res() res: Response): Promise<void> {
    const result = await this.masterDataService.DeleteFavicon();
    res.json({
      success: true,
      message: 'Berhasil menghapus favicon',
      data: result,
    });
  }

  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Patch('/basic-information')
  async BasicInformation(
    @Body() request: ReqBasicInformation,
  ): Promise<WebResponse<MasterDataResponse>> {
    const result = await this.masterDataService.BasicInformation(request);

    return {
      data: result as MasterDataResponse,
      success: true,
      message: 'Berhasil mengubah informasi dasar',
    };
  }

  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Patch('/contact-service')
  async ContactService(
    @Body() request: ReqcontactService,
  ): Promise<WebResponse<MasterDataResponse>> {
    const result = await this.masterDataService.ContactService(request);
    return {
      data: result as MasterDataResponse,
      success: true,
      message: 'Berhasil mengubah informasi layanan kontak',
    };
  }
}
