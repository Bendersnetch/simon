import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, Min, Max, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateSensorDto {
    @ApiProperty()
    @IsString()
    nom: string;

    @ApiProperty()
    @IsString()
    origin: string;

    @ApiProperty()
    @IsString()
    apiKey: string;

    @ApiProperty()
    @IsString()
    type: string;

    @ApiProperty()
    @IsNumber()
    @Transform((obj) => parseFloat(obj.value))
    @Min(-180)
    @Max(180)
    longitude: number;

    @ApiProperty()
    @IsNumber()
    @Transform((obj) => parseFloat(obj.value))
    @Min(-90)
    @Max(90)
    latitude: number;
}