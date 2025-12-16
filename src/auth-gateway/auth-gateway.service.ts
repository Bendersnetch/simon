import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { LoginDto } from './dto/login.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthGatewayService {
    constructor(private readonly httpService: HttpService) {}

    private BASE_URL = "http://localhost:3002/api/v1";

    async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        const response$ = this.httpService.post(`${this.BASE_URL}/auth/register`, createUserDto);
        const response = await firstValueFrom(response$);
        return response.data;
    }

    async login(loginDto: LoginDto): Promise<{token: string}> {
        const response$ = this.httpService.post(`${this.BASE_URL}/auth/login`, loginDto);
        const response = await firstValueFrom(response$);
        return response.data;
    }
}
