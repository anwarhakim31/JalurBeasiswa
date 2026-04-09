import { Global, Module } from '@nestjs/common';
import { CommonController } from './common.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { ValidationService } from './validation.service';
import { JwtModule } from '@nestjs/jwt';
import { ErrorFilter } from './error.filter';
@Global()
@Module({
  controllers: [CommonController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '8h' },
    }),
  ],
  providers: [
    PrismaService,
    ValidationService,
    {
      provide: 'APP_FILTER',
      useClass: ErrorFilter,
    },
  ],
  exports: [PrismaService, ValidationService],
})
export class CommonModule {}
