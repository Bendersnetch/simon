import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class SensorClientService {
    private readonly CAPTEUR_SERVICE_BASE_URL = process.env.CAPTEUR_SERVICE_BASE_URL ?? "http://localhost:3005/api/v1";
    
    constructor(private readonly httpService: HttpService) {}

    async getSensorByOrigin(origin: string, apiKey: string) {
        const url = `${this.CAPTEUR_SERVICE_BASE_URL}/sensor/${origin}?api-key=${apiKey}`;
        console.log(url);

        const response = await this.httpService.axiosRef.get(url);
        return response.data;
    }
}
