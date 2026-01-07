import { Controller, Get } from '@nestjs/common';
import { SensorDataGatewayService } from './sensor-data-gateway.service';

@Controller('sensor-data-gateway')
export class SensorDataGatewayController {
    constructor(private readonly sensorDataGatewayService: SensorDataGatewayService) {}

    @Get("recent")
    async getRecent() {
        return this.sensorDataGatewayService.getRecent();
    }
}
