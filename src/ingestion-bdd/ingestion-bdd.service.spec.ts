import { Test, TestingModule } from '@nestjs/testing';
import { IngestionBddService } from './ingestion-bdd.service';

describe('IngestionBddService', () => {
  let service: IngestionBddService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IngestionBddService],
    }).compile();

    service = module.get<IngestionBddService>(IngestionBddService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
