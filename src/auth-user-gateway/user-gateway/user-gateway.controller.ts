import { Controller, Post, Body, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { UserGatewayService } from './user-gateway.service';

@Controller('user')
export class UserGatewayController {
    constructor(private readonly userGatewayService: UserGatewayService) {}

    @Delete(':email')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteUserByEmail(@Param("email") email: string): Promise<void> {
        return this.userGatewayService.deleteUserByEmail(email);
    }
}
