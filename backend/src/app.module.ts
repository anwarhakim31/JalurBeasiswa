import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { PhotoModule } from './photo/photo.module';
import { BeasiswaModule } from './beasiswa/beasiswa.module';
import { AlternativeModule } from './alternative/alternative.module';
import { CriteriaModule } from './criteria/criteria.module';
import { AlternativeValueModule } from './alternative-value/alternative-value.module';
import { ProcessValuesModule } from './process-values/process-values.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MasterDataModule } from './master-data/master-data.module';

@Module({
  imports: [
    UserModule,
    CommonModule,
    AuthModule,
    PhotoModule,
    BeasiswaModule,
    AlternativeModule,
    CriteriaModule,
    AlternativeValueModule,
    ProcessValuesModule,
    DashboardModule,
    MasterDataModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
