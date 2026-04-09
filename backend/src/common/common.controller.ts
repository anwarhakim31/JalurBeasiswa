import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class CommonController {
  @Get()
  async index() {
    return { message: 'Server is running' };
  }
}
