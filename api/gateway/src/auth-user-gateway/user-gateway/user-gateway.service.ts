import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UserGatewayService {
    constructor(private readonly httpService: HttpService) {}

    private BASE_URL = process.env.AUTH_USER_SERVICE_URL || "http://localhost:3002/api/v1";

    async deleteUserByEmail(email: string) {
        const response$ = this.httpService.delete(`${this.BASE_URL}/user/${email}`);
        const response = await firstValueFrom(response$);
        return response.data;
    }
}