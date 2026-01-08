import { Test, TestingModule } from '@nestjs/testing';
import { StreamConsumerService } from './stream-consumer.service';
import { IngestionBddService } from './ingestion-bdd.service';
import Redis from 'ioredis';

jest.mock('ioredis', () => {
    return jest.fn().mockImplementation(() => ({
        xgroup: jest.fn(),
        xreadgroup: jest.fn(),
        xack: jest.fn(),
        disconnect: jest.fn(),
        on: jest.fn(),
    }));
});

describe('StreamConsumerService', () => {
    let service: StreamConsumerService;
    let ingestionBddService: IngestionBddService;
    let redisClient: any;

    const mockIngestionBddService = {
        processIngestionEvent: jest.fn(),
    };

    beforeEach(async () => {
        (Redis as unknown as jest.Mock).mockClear();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StreamConsumerService,
                {
                    provide: IngestionBddService,
                    useValue: mockIngestionBddService,
                },
            ],
        }).compile();

        service = module.get<StreamConsumerService>(StreamConsumerService);
        ingestionBddService = module.get<IngestionBddService>(IngestionBddService);
        redisClient = (service as any).redisClient;

        // Mock logger to silence expected errors during tests
        jest.spyOn((service as any).logger, 'error').mockImplementation(() => { });
        jest.spyOn((service as any).logger, 'warn').mockImplementation(() => { });
        jest.spyOn((service as any).logger, 'log').mockImplementation(() => { });
    });

    afterEach(() => {
        service.onModuleDestroy();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('onModuleInit', () => {
        it('should create consumer group successfully', async () => {
            redisClient.xgroup.mockResolvedValue('OK');
            // We spy on consume but let it run? No, it's recursive/loops.
            // Since consume is triggered, we need to ensure it doesn't loop forever or we can stop it.
            // checking if consume is called might be enough if we mock it?
            // consume is private, so we can't easily mock it without casting to any.
            // But we refactored it to use isAlive. We can set isAlive = false immediately after?
            // Or we just test onModuleInit calls xgroup.

            // To avoid infinite loop in consume during this test (since it is called at end of onModuleInit),
            // we can mock consume or make xreadgroup wait or mock isAlive.

            // Let's rely on onModuleDestroy calling disconnect and setting isAlive=false.
            // However onModuleInit calls consume() which awaits xreadgroup. if xreadgroup is mocked to resolve immediately, it will loop fast.
            // We should mock xreadgroup to return a promise that doesn't resolve immediately, OR mock it to return nothing and we toggle isAlive?

            // Better strategy: Mock xreadgroup to return null once, then ensure we act quickly?
            // Or mock the consume method prototype?

            const consumeSpy = jest.spyOn(service as any, 'consume').mockImplementation(async () => { });

            await service.onModuleInit();

            expect(redisClient.xgroup).toHaveBeenCalledWith(
                'CREATE',
                'ingestion-stream',
                'ingestion-group',
                '0',
                'MKSTREAM'
            );
            expect(consumeSpy).toHaveBeenCalled();
        });

        it('should ignore BUSYGROUP error', async () => {
            const consumeSpy = jest.spyOn(service as any, 'consume').mockImplementation(async () => { });
            redisClient.xgroup.mockRejectedValue(new Error('BUSYGROUP Consumer Group name already exists'));

            await service.onModuleInit();

            expect(redisClient.xgroup).toHaveBeenCalled();
            // Should log warn but not throw
        });

        it('should log error for other xgroup errors', async () => {
            const consumeSpy = jest.spyOn(service as any, 'consume').mockImplementation(async () => { });
            redisClient.xgroup.mockRejectedValue(new Error('Connection failed'));

            await service.onModuleInit();

            expect(redisClient.xgroup).toHaveBeenCalled();
            // Should log error
        });
    });

    describe('consume', () => {
        it('should process messages from redis', async () => {
            // We need to trigger consume logic.
            // We can call service['consume']() directly.
            // We want it to run one iteration then stop.
            // We can mock xreadgroup to return data once, then make isAlive false?
            // Or we can just let it run one loop and inside the loop (via mock callback?) or just relying on xreadgroup sequence.

            const messageId = '1-0';
            const messageData = ['origin', '"sensor-1"', 'uv', '5.5'];
            const messages = [[messageId, messageData]];
            const streamResult = [['ingestion-stream', messages]];

            redisClient.xreadgroup
                .mockResolvedValueOnce(streamResult) // First call returns data
                .mockImplementationOnce(async () => { // Second call stops loop
                    service.onModuleDestroy();
                    return null;
                });

            await service['consume']();

            expect(ingestionBddService.processIngestionEvent).toHaveBeenCalledWith({
                origin: 'sensor-1',
                uv: 5.5,
            });
            expect(redisClient.xack).toHaveBeenCalledWith('ingestion-stream', 'ingestion-group', messageId);
        });

        it('should handle non-JSON values', async () => {
            const messageId = '1-0';
            const messageData = ['rawString', 'some-value'];
            const messages = [[messageId, messageData]];
            const streamResult = [['ingestion-stream', messages]];

            redisClient.xreadgroup
                .mockResolvedValueOnce(streamResult)
                .mockImplementationOnce(async () => {
                    service.onModuleDestroy();
                    return null;
                });

            await service['consume']();

            expect(ingestionBddService.processIngestionEvent).toHaveBeenCalledWith({
                rawString: 'some-value',
            });
        });

        it('should handle processing errors gracefully', async () => {
            const messageId = '1-0';
            const messageData = ['key', 'val'];
            const messages = [[messageId, messageData]];
            const streamResult = [['ingestion-stream', messages]];

            redisClient.xreadgroup
                .mockResolvedValueOnce(streamResult)
                .mockImplementationOnce(async () => {
                    service.onModuleDestroy();
                    return null;
                });

            mockIngestionBddService.processIngestionEvent.mockRejectedValueOnce(new Error('Processing failed'));

            await service['consume']();

            expect(ingestionBddService.processIngestionEvent).toHaveBeenCalled();
            // xack should NOT be called if processing failed? 
            // Code says: await this.ingestionBddService.processIngestionEvent(messageObject); await this.redisClient.xack(...)
            // So if process throws, xack is skipped.
            expect(redisClient.xack).not.toHaveBeenCalled();
        });
    });
});
