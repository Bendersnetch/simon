import { Body, Controller, Post } from '@nestjs/common';
import { SensorGatewayService } from './sensor-gateway.service';
import { CreateSensorDto } from './dto/create-sensor.dto';

@Controller('sensor-gateway')
export class SensorGatewayController {
    constructor(private readonly sensorGatewayService: SensorGatewayService) {}

    @Post()
    async createSensor(@Body() createSensorDto: CreateSensorDto) {
        return this.sensorGatewayService.createSensor(createSensorDto);
    }
}
