import { Test, TestingModule } from '@nestjs/testing';
import { CreteriaService } from './creteria.service';

describe('CreteriaService', () => {
  let service: CreteriaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreteriaService],
    }).compile();

    service = module.get<CreteriaService>(CreteriaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
