import { CanActivate, ExecutionContext, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { SensorClientService } from 'src/sensor-client/sensor-client.service';
import { Sensor } from './sensor.interface';

@Injectable()
export class IngestionGuard implements CanActivate {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly sensorClient: SensorClientService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const body = request.body;
    const origin = body?.origin;

    if (!apiKey || !origin) {
      throw new UnauthorizedException('API key or origin is missing');
    }

    let sensor: Sensor | undefined;

    try {
        sensor = await this.cacheManager.get(`sensor:${origin}`);

        if (!sensor) {
            sensor = await this.sensorClient.getSensorByOrigin(origin, apiKey);
            if (sensor) {
                await this.cacheManager.set(`sensor:${origin}`, sensor, 300);
            }
        }
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            throw new NotFoundException('Capteur non trouvé');
        } else if (error.response && error.response.status === 401) {
            throw new UnauthorizedException('Clé API invalide');
        } else {
            throw new InternalServerErrorException({
              message: 'Impossible de vérifier le capteur pour le moment',
              error: error?.message,
            });
        }
    }

    if (!sensor || !sensor.status) {
      throw new UnauthorizedException("Capteur invalide ou inactif");
    }

    request.sensor = sensor;

    return true;
  }
}
