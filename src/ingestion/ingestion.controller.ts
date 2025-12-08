import { Controller, Post, Body } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { IngestionTempDto } from './ingestionTempDto';

@Controller('ingestion')
export class IngestionController {
    constructor(private readonly ingestionService: IngestionService) {}

    @Post()
    async ingestionDonneesCapteur(@Body() ingestionTempDto: IngestionTempDto) {
        // TODO gérer l'ingestion
        await this.ingestionService.addSensorData(ingestionTempDto);
    }
}
