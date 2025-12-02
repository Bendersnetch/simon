import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sensor } from './sensor.entity';
import { CreateSensorDto } from './dto/create-sensor.dto';

@Injectable()
export class SensorService {
    constructor(@InjectRepository(Sensor) private readonly sensorRepository: Repository<Sensor>) {}

    async createSensor(createSensorDto: CreateSensorDto): Promise<Sensor> {
        const sensor = this.sensorRepository.create(createSensorDto);
        return this.sensorRepository.save(sensor);
    }

    /*
    async updateSensor(id: number, ) */

    async updateStatusSensor(id: number, status: boolean): Promise<Sensor> {
        const sensor = await this.sensorRepository.findOne({ where: {id} });

        if (!sensor) {
            throw new NotFoundException(`Sensor ${id} not found`);
        }

        sensor.status = status;
        return this.sensorRepository.save(sensor);
    }
}
