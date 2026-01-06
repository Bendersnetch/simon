import { Controller, Post, Body, UseGuards, Headers } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { Ingestion } from './ingestion.entity';
import { IngestionGuard } from './ingestion.guard';
import { ApiTags, ApiHeader, ApiBody } from '@nestjs/swagger';

@Controller('ingestion')
@UseGuards(IngestionGuard)
export class IngestionController {
    constructor(private readonly ingestionService: IngestionService) {}

    @Post()
    @ApiHeader({
        name: 'x-api-key',
        description: 'Clé API pour authentification',
    })
    async ingestionDonneesCapteur(@Body() ingestion: Ingestion, @Headers('x-api-key') apiKey: string) {
        await this.ingestionService.addSensorData(ingestion);
    }
}
