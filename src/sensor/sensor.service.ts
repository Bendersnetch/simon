import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sensor } from './sensor.entity';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { Point } from 'typeorm';

@Injectable()
export class SensorService {
    constructor(@InjectRepository(Sensor) private readonly sensorRepository: Repository<Sensor>) {}

    async createSensor(createSensorDto: CreateSensorDto): Promise<Sensor> {
        const point: Point = {
            type: 'Point',
            coordinates: [createSensorDto.longitude, createSensorDto.latitude]
        }

        const sensor = this.sensorRepository.create({
            nom: createSensorDto.nom,
            origin: createSensorDto.origin,
            apiKey: createSensorDto.apiKey,
            type: createSensorDto.type,
            localisation: point
        });
        return this.sensorRepository.save(sensor);
    }

    async updateStatusSensor(id: number, status: boolean): Promise<Sensor> {
        const sensor = await this.sensorRepository.findOne({ where: {id} });

        if (!sensor) {
            throw new NotFoundException(`Sensor ${id} not found`);
        }

        sensor.status = status;
        return this.sensorRepository.save(sensor);
    }
}
