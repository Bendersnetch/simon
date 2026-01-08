import { Test, TestingModule } from '@nestjs/testing';
import { IngestionBddModule } from './ingestion-bdd.module';
import { IngestionBddService } from './ingestion-bdd.service';
import { CassandraService } from '../cassandra/cassandra.service';

describe('IngestionBddModule', () => {
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [IngestionBddModule],
        })
            .overrideProvider(CassandraService)
            .useValue({ // Mock CassandraService to avoid real connection attempts during module init if any
                onModuleInit: jest.fn(),
                onModuleDestroy: jest.fn(),
                execute: jest.fn(),
            })
            .compile();
    });

    it('should be defined', () => {
        const service = module.get<IngestionBddService>(IngestionBddService);
        expect(service).toBeDefined();
    });
});
