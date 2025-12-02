import { ApiProperty } from "@nestjs/swagger";

export class CreateSensorDto {
    @ApiProperty()
    nom: string

    @ApiProperty()
    type: string

    @ApiProperty()
    localisation: string
}