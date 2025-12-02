import { ApiProperty } from "@nestjs/swagger";

export class CreateSensorDto {
    @ApiProperty()
    nom: string;

    @ApiProperty()
    origin: string;

    @ApiProperty()
    apiKey: string;

    @ApiProperty()
    type: string;

    @ApiProperty()
    localisation: string;
}