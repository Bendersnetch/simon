import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { SensorGatewayService } from '../src/sensor-gateway/sensor-gateway.service';

describe('SensorGatewayController (e2e)', () => {
    let app: INestApplication;
    const mockSensorGatewayService = {
        createSensor: jest.fn(),
    };

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(SensorGatewayService)
            .useValue(mockSensorGatewayService)
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/sensor-gateway (POST)', async () => {
        const createSensorDto = {
            name: 'Test Sensor',
            type: 'Temperature',
            location: 'Room 1',
            active: true,
            minVal: 0,
            maxVal: 100
        };
        const response = {
            id: 1,
            ...createSensorDto
        };
        mockSensorGatewayService.createSensor.mockResolvedValue(response);

        return request(app.getHttpServer())
            .post('/sensor-gateway')
            .send(createSensorDto)
            .expect(201)
            .expect(response);
    });
});
