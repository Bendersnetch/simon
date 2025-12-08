import { Controller, Post, Put, Body, Param, Patch, Delete, HttpCode } from '@nestjs/common';
import { SensorService } from './sensor.service';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateStatusSensorDto } from './dto/update-status-sensor.dto';

@Controller('sensor')
export class SensorController {
    constructor(private readonly sensorService: SensorService) {}

    @Post()
    async createSensor(@Body() createSensorDto: CreateSensorDto) {
        return await this.sensorService.createSensor(createSensorDto);
    }

    @Patch(":id/status")
    async updateStatus(@Param("id") id: number, @Body() updateStatusSensorDto: UpdateStatusSensorDto) {
        return await this.sensorService.updateStatusSensor(id, updateStatusSensorDto.status);
    }

    @Put(":id")
    async updateSensor(@Param("id") id: number, @Body() createSensorDto: CreateSensorDto) {
        return await this.sensorService.updateSensor(id, createSensorDto);
    }

    @Delete(":id")
    @HttpCode(204)
    async deleteSensor(@Param("id") id: number) {
        await this.sensorService.deleteSensor(id);
    }   
}
