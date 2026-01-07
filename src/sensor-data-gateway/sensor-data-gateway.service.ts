import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SensorDataGatewayService {
    constructor(private readonly httpService: HttpService) {}

    private BASE_URL = process.env.SENSOR_DATA_SERVICE_BASE_URL ?? "http://localhost:3006/api/v1";
    
    async getrecent() {
        const response$ = this.httpService.get(`${this.BASE_URL}/sensor-data/recent`);
        const response = await firstValueFrom(response$);
        return response.data;
    }
}
