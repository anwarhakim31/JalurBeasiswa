import { Test, TestingModule } from '@nestjs/testing';
import { CreteriaController } from './creteria.controller';

describe('CreteriaController', () => {
  let controller: CreteriaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreteriaController],
    }).compile();

    controller = module.get<CreteriaController>(CreteriaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
