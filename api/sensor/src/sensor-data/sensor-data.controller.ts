import { Controller, Get } from '@nestjs/common';
import { SensorDataService } from './sensor-data.service';

@Controller('sensor-data')
export class SensorDataController {
    constructor(private readonly sensorDataService: SensorDataService) {}

    @Get('recent')
    async getRecent() {
        return this.sensorDataService.getRecent();
    }
}
