import { Test, TestingModule } from '@nestjs/testing';
import { CassandraService } from './cassandra.service';
import { Client } from 'cassandra-driver';

// Mock the cassandra-driver module
jest.mock('cassandra-driver', () => {
    return {
        Client: jest.fn().mockImplementation(() => ({
            connect: jest.fn(),
            execute: jest.fn(),
            shutdown: jest.fn(),
        })),
    };
});

describe('CassandraService', () => {
    let service: CassandraService;
    let mockClient: any;

    beforeEach(async () => {
        // Reset mocks before each test
        // We need to re-instantiate because the service creates a new Client in onModuleInit
        (Client as unknown as jest.Mock).mockClear();

        // We can capture the specific mock instance if needed, or setup the mock implementation to return a specific object we control.
        // Here we relied on the factory in jest.mock, but let's refine it to verify calls on the specific instance.

        const module: TestingModule = await Test.createTestingModule({
            providers: [CassandraService],
        }).compile();

        service = module.get<CassandraService>(CassandraService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('onModuleInit', () => {
        it('should connect and parse keyspace/table creation queries', async () => {
            // Setup successful connection
            const connectMock = jest.fn().mockResolvedValue(undefined);
            const executeMock = jest.fn().mockResolvedValue(undefined);

            (Client as unknown as jest.Mock).mockImplementation(() => ({
                connect: connectMock,
                execute: executeMock,
            }));

            await service.onModuleInit();

            expect(Client).toHaveBeenCalled();
            expect(connectMock).toHaveBeenCalled();
            // Should execute creation of keyspace and table
            expect(executeMock).toHaveBeenCalledTimes(2);
            expect(executeMock).toHaveBeenCalledWith(expect.stringContaining('CREATE KEYSPACE IF NOT EXISTS'));
            expect(executeMock).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS'));
        });

        it('should retry connection if it fails initially', async () => {
            jest.useFakeTimers();

            const connectMock = jest.fn()
                .mockRejectedValueOnce(new Error('Connection failed'))
                .mockResolvedValueOnce(undefined);
            const executeMock = jest.fn().mockResolvedValue(undefined);

            (Client as unknown as jest.Mock).mockImplementation(() => ({
                connect: connectMock,
                execute: executeMock,
            }));

            const initPromise = service.onModuleInit();

            // Fast-forward time to skip the 3000ms delay
            // We need to run pending timers multiple times if there are multiple loops, 
            // but here we expect 1 failure wait, then success.
            // However, we must be careful: the promise is awaiting the timer.
            // We need to advance timers while the promise is pending.
            await jest.runAllTimersAsync();

            await initPromise;

            expect(connectMock).toHaveBeenCalledTimes(2);

            jest.useRealTimers();
        });
    });

});
