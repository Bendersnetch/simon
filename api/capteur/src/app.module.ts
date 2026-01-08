import { Module } from '@nestjs/common';
import { SensorModule } from './sensor/sensor.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sensor } from './sensor/sensor.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432", 10),
      username: process.env.DB_USERNAME || "root",
      password: process.env.DB_PASSWORD || "root",
      database: process.env.DB_DATABASE || "projet_simon",
      entities: [Sensor],
      synchronize: true
    }),
    SensorModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
