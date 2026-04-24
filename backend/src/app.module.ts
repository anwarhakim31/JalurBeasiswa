import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { PhotoController } from './photo/photo.controller';
import { PhotoModule } from './photo/photo.module';
import { BeasiswaModule } from './beasiswa/beasiswa.module';
import { AlternativeModule } from './alternative/alternative.module';
import { CreteriaModule } from './creteria/creteria.module';

@Module({
  imports: [UserModule, CommonModule, AuthModule, PhotoModule, BeasiswaModule, AlternativeModule, CreteriaModule],
  controllers: [PhotoController],
  providers: [],
})
export class AppModule {}
