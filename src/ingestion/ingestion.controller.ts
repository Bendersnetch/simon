import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { IngestionTempDto } from './ingestionTempDto';
import { IngestionGuard } from './ingestion.guard';

@Controller('ingestion')
@UseGuards(IngestionGuard)
export class IngestionController {
    constructor(private readonly ingestionService: IngestionService) {}

    @Post()
    async ingestionDonneesCapteur(@Body() ingestionTempDto: IngestionTempDto) {
        // TODO gérer l'ingestion
        await this.ingestionService.addSensorData(ingestionTempDto);
    }
}
