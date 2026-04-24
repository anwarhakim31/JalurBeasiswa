import { Module } from '@nestjs/common';
import { CreteriaController } from './creteria.controller';
import { CreteriaService } from './creteria.service';

@Module({
  controllers: [CreteriaController],
  providers: [CreteriaService]
})
export class CreteriaModule {}
