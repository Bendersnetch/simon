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

  describe('testPing', () => {
    it('should process valid JSON message', async () => {
      const payload = { test: 'data' };
      const message = {
        value: Buffer.from(JSON.stringify(payload)),
      };

      // We are just testing that it doesn't throw and parses correctly
      // Since the method doesn't return anything or call external services in the success path (other than log),
      // we just ensure it executes without error.
      await expect(service.testPing(message)).resolves.not.toThrow();
    });

    it('should handle invalid JSON message gracefully', async () => {
      const message = {
        value: Buffer.from('invalid-json'),
      };

      await expect(service.testPing(message)).resolves.not.toThrow();
    });

    it('should ignore message with empty value (tombstone)', async () => {
      const message = {
        value: null,
      };

      await expect(service.testPing(message)).resolves.not.toThrow();
    });
  });

  describe('addSensorData', () => {
    it('should save ingestion data to cassandra', async () => {
      const ingestionData: Ingestion = {
        origin: 'sensor-1',
        timestamp: new Date(),
        uv: 5.5,
        temperature: 25.0,
        humidite: 60.0,
        qair: [1.1, 2.2],
      };

      await service.addSensorData(ingestionData);

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
