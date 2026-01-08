import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sensor } from './sensor.entity';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { Point } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SensorService {
    constructor(@InjectRepository(Sensor) private readonly sensorRepository: Repository<Sensor>) {}

    async getSensorByOrigin(origin: string, apiKey: string): Promise<Sensor> {
        const sensor = await this.sensorRepository.findOne({ where: {origin} });

        if (!sensor) {
            throw new NotFoundException(`Sensor ${origin} not found`);
        }

        const isValid = await bcrypt.compare(apiKey, sensor.apiKey);
        if (!isValid) {
            throw new UnauthorizedException('Invalid API key');
        }

        return sensor;
    }
    
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
            localisation: point,
            status: createSensorDto.active ?? false
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

    async updateSensor(id: number, createSensorDto: CreateSensorDto): Promise<Sensor> {
        const sensor = await this.sensorRepository.findOne({ where: {id} });

        if (!sensor) {
            throw new NotFoundException(`Sensor ${id} not found`);
        }

        if (createSensorDto.apiKey) {
            createSensorDto.apiKey = await bcrypt.hash(createSensorDto.apiKey, 10);
        }

        const point: Point = {
            type: 'Point',
            coordinates: [createSensorDto.longitude, createSensorDto.latitude]
        }

        sensor.nom = createSensorDto.nom;
        sensor.origin = createSensorDto.origin;
        sensor.apiKey = createSensorDto.apiKey;
        sensor.type = createSensorDto.type;
        sensor.localisation = point
        sensor.status = createSensorDto.active ?? sensor.status

        return this.sensorRepository.save(sensor);
    }

    async deleteSensor(id: number) {
        const result = await this.sensorRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Sensor with id ${id} not found`);
        }
    }
}
