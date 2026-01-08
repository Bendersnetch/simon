import { Module } from '@nestjs/common';
import { AuthUserGatewayModule } from './auth-user-gateway/auth-user-gateway.module';
import { SensorGatewayModule } from './sensor-gateway/sensor-gateway.module';
import { SensorDataGatewayModule } from './sensor-data-gateway/sensor-data-gateway.module';

@Module({
  imports: [AuthUserGatewayModule, SensorDataGatewayModule, SensorGatewayModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
