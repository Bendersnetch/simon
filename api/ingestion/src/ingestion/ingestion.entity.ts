import { ApiProperty } from "@nestjs/swagger";

export class Ingestion {
    @ApiProperty()
    origin: string;

    @ApiProperty()
    timestamp: Date;

    @ApiProperty()
    uv: number;

    @ApiProperty()
    temperature: number;

    @ApiProperty()
    humidite: number;

    @ApiProperty()
    qair: number[];
}