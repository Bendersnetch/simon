import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class SensorClientService {
    private readonly BASE_URL = "http://localhost:3000/api/v1";

    constructor(private readonly httpService: HttpService) {}

    async getSensorByOrigin(origin: string, apiKey: string) {
        const url = `${this.BASE_URL}/sensor/${origin}?api-key=${apiKey}`;
        console.log(url);

        const response = await this.httpService.axiosRef.get(url);
        return response.data;
    }
}
