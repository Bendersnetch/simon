import { Test, TestingModule } from '@nestjs/testing';
import { IngestionBddService } from './ingestion-bdd.service';
import { CassandraService } from '../cassandra/cassandra.service';
import { Ingestion } from './ingestion.entity';

describe('IngestionBddService', () => {
  let service: IngestionBddService;
  let cassandraService: CassandraService;

  const mockCassandraService = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionBddService,
        {
          provide: CassandraService,
          useValue: mockCassandraService,
        },
      ],
    }).compile();

    service = module.get<IngestionBddService>(IngestionBddService);
    cassandraService = module.get<CassandraService>(CassandraService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processIngestionEvent', () => {
    it('should save ingestion data to cassandra', async () => {
      const ingestionData = {
        origin: 'sensor-1',
        timestamp: new Date(),
        uv: 5.5,
        temperature: 25.0,
        humidite: 60.0,
        qair: [1.1, 2.2],
      };

      await service.processIngestionEvent(ingestionData);

      expect(cassandraService.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO capteur_data.ingestion_data'),
        expect.arrayContaining([
          ingestionData.origin,
          ingestionData.timestamp,
          ingestionData.uv,
          ingestionData.temperature,
          ingestionData.humidite,
          ingestionData.qair,
        ])
      );
    });
  });
});
