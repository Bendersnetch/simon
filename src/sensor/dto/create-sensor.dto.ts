import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsBoolean, Min, Max, IsString, IsOptional } from 'class-validator';
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

    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    active?: boolean;
}