import { Module } from '@nestjs/common';
import { BeasiswaController } from './beasiswa.controller';
import { BeasiswaService } from './beasiswa.service';

@Module({
  controllers: [BeasiswaController],
  providers: [BeasiswaService],
})
export class BeasiswaModule {}
