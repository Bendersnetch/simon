import { Module } from '@nestjs/common';
import { AuthUserGatewayModule } from './auth-user-gateway/auth-user-gateway.module';

@Module({
  imports: [AuthUserGatewayModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
