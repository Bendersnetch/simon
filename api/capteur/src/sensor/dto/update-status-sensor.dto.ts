import { ApiProperty } from "@nestjs/swagger";

export class UpdateStatusSensorDto {
    @ApiProperty()
    status: boolean;
}