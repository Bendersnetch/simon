// cassandra.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Client } from 'cassandra-driver';

@Injectable()
export class CassandraService implements OnModuleInit, OnModuleDestroy {
    private client: Client;

    async onModuleInit() {
        this.client = new Client({
            contactPoints: ['cassandra'],
            localDataCenter: 'datacenter1',
            keyspace: 'capteur_data',
        });
        await this.client.connect();
    }

    onModuleDestroy() {
        return this.client.shutdown();
    }

    async query(query: string, params: any[] = []) {
        return this.client.execute(query, params, { prepare: true });
    }
}
