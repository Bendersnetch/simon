import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SensorGatewayService {
    constructor(private readonly httpService: HttpService) {}

    private BASE_URL = process.env.SENSOR_SERVICE_BASE_URL ?? "http://localhost:3000/api/v1";
    
    async createSensor(createSensorDto: CreateSensorDto) {
        const response$ = this.httpService.post(`${this.BASE_URL}/sensor`, createSensorDto);
        const response = await firstValueFrom(response$);
        return response.data;
    }
}
