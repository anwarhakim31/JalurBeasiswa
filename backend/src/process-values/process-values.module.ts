import { Module } from '@nestjs/common';
import { ProcessValuesService } from './process-values.service';
import { ProcessValuesController } from './process-values.controller';

@Module({
  providers: [ProcessValuesService],
  controllers: [ProcessValuesController]
})
export class ProcessValuesModule {}
