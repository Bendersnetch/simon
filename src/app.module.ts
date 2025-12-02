import { Module } from '@nestjs/common';
import { SensorModule } from './sensor/sensor.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sensor } from './sensor/sensor.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "root",
      password: "root",
      database: "projet_simon",
      entities: [Sensor],
      synchronize: true
    }),
    SensorModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
