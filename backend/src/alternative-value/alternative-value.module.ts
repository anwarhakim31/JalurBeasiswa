import { Module } from '@nestjs/common';
import { AlternativeValueController } from './alternative-value.controller';
import { AlternativeValueService } from './alternative-value.service';

@Module({
  controllers: [AlternativeValueController],
  providers: [AlternativeValueService]
})
export class AlternativeValueModule {}
