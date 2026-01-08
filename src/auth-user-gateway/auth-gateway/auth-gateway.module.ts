import { Module } from '@nestjs/common';
import { AuthGatewayService } from './auth-gateway.service';
import { AuthGatewayController } from './auth-gateway.controller';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [AuthGatewayController],
  providers: [AuthGatewayService],
})
export class AuthGatewayModule {}
