import { Module } from '@nestjs/common';
import { AuthGatewayModule } from './auth-gateway/auth-gateway.module';
import { UserGatewayModule } from './user-gateway/user-gateway.module';

@Module({
  imports: [AuthGatewayModule, UserGatewayModule],
})
export class AuthUserGatewayModule {}