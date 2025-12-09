import { Controller, Get, Post, Put, Body, Param, Patch, Delete, HttpCode, Query } from '@nestjs/common';
import { SensorService } from './sensor.service';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateStatusSensorDto } from './dto/update-status-sensor.dto';

@Controller('sensor')
export class SensorController {
    constructor(private readonly sensorService: SensorService) {}

    @Get(":origin")
    async getSensorByOrigin(@Param("origin") origin: string, @Query("api-key") apiKey: string) {
        return this.sensorService.getSensorByOrigin(origin, apiKey);
    }

    @Post()
    async createSensor(@Body() createSensorDto: CreateSensorDto) {
        return this.sensorService.createSensor(createSensorDto);
    }

    @Patch(":id/status")
    async updateStatus(@Param("id") id: number, @Body() updateStatusSensorDto: UpdateStatusSensorDto) {
        return this.sensorService.updateStatusSensor(id, updateStatusSensorDto.status);
    }

    @Put(":id")
    async updateSensor(@Param("id") id: number, @Body() createSensorDto: CreateSensorDto) {
        return this.sensorService.updateSensor(id, createSensorDto);
    }

    @Delete(":id")
    @HttpCode(204)
    async deleteSensor(@Param("id") id: number) {
        await this.sensorService.deleteSensor(id);
    }
}
