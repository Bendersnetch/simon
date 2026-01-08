import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { SensorDataGatewayService } from '../src/sensor-data-gateway/sensor-data-gateway.service';

describe('SensorDataGatewayController (e2e)', () => {
    let app: INestApplication;
    const mockSensorDataGatewayService = {
        getRecent: jest.fn(),
    };

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(SensorDataGatewayService)
            .useValue(mockSensorDataGatewayService)
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/sensor-data-gateway/recent (GET)', () => {
        const recentData = [
            { id: 1, value: 25.5, timestamp: new Date().toISOString() }
        ];
        mockSensorDataGatewayService.getRecent.mockResolvedValue(recentData);

        return request(app.getHttpServer())
            .get('/sensor-data-gateway/recent')
            .expect(200)
            .expect(recentData);
    });
});
