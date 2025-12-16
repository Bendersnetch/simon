import { Module } from '@nestjs/common';
import { AuthGatewayModule } from './auth-gateway/auth-gateway.module';

@Module({
  imports: [AuthGatewayModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
