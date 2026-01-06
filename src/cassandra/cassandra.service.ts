import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Client } from 'cassandra-driver';

@Injectable()
export class CassandraService implements OnModuleInit, OnModuleDestroy {
    private client: Client;

    async onModuleInit() {
        this.client = new Client({
            contactPoints: ['cassandra'],
            localDataCenter: 'datacenter1',
            keyspace: "capteur_data"
        });

        let connected = false;
        while (!connected) {
            try {
                await this.client.connect();
                connected = true;
            } catch (err) {
                console.log('Waiting for Cassandra to be ready...');
                await new Promise(res => setTimeout(res, 3000));
            }
        }

        await this.client.execute(`
            CREATE KEYSPACE IF NOT EXISTS capteur_data
            WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '1'}
        `);

        await this.client.execute(`
            CREATE TABLE IF NOT EXISTS capteur_data.ingestion_data (
            id uuid PRIMARY KEY,
            origin text,
            timestamp timestamp,
            uv double,
            temperature double,
            humidite double,
            qair list<double>
            )
        `);
    }

    onModuleDestroy() {
        return this.client.shutdown();
    }

    async execute(query: string, params: any[] = []) {
        return this.client.execute(query, params, {prepare: true});
    }
}