import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UserGatewayController } from './user-gateway.controller';
import { UserGatewayService } from './user-gateway.service';

@Module({
  imports: [HttpModule],
  controllers: [UserGatewayController],
  providers: [UserGatewayService],
})
export class UserGatewayModule {}