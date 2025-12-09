import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Client } from 'cassandra-driver';

@Injectable()
export class CassandraService implements OnModuleInit, OnModuleDestroy {
    private client: Client;

    async onModuleInit() {
        this.client = new Client({
            contactPoints: ['127.0.0.1'],
            localDataCenter: 'datacenter1',
            keyspace: "capteur_data"
        });
    }

    onModuleDestroy() {
        return this.client.shutdown();
    }

    async execute(query: string, params: any[] = []) {
        return this.client.execute(query, params, {prepare: true});
    }
}
