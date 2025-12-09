import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { Ingestion } from './ingestion.entity';
import { IngestionGuard } from './ingestion.guard';

@Controller('ingestion')
@UseGuards(IngestionGuard)
export class IngestionController {
    constructor(private readonly ingestionService: IngestionService) {}

    @Post()
    async ingestionDonneesCapteur(@Body() ingestion: Ingestion) {
        await this.ingestionService.addSensorData(ingestion);
    }
}
