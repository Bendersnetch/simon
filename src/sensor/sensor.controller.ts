import { Controller, Post, Body, Param, Patch } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { SensorService } from './sensor.service';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateStatusSensorDto } from './dto/update-status-sensor.dto';

@Controller('sensor')
export class SensorController {
    constructor(private readonly sensorService: SensorService) {}

    @Post()
    receiveValue(@Body() createSensorDto: CreateSensorDto) {
        return this.sensorService.createSensor(createSensorDto);
    }

    @Patch(":id/status")
    updateStatus(@Param("id") id: number, @Body() updateStatusSensorDto: UpdateStatusSensorDto) {
        return this.sensorService.updateStatusSensor(id, updateStatusSensorDto.status);
    }
}
