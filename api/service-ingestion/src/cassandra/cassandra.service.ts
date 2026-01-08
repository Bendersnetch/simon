import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Client } from 'cassandra-driver';

@Injectable()
export class CassandraService implements OnModuleInit, OnModuleDestroy {
    private client: Client;

    async onModuleInit() {
        this.client = new Client({
            contactPoints: ['cassandra'],
            localDataCenter: 'DC1',
            socketOptions: { connectTimeout: 10000 } // Corrected property name
        });

        let connected = false;
        while (!connected) {
            try {
                await this.client.connect();
                connected = true;
            } catch (err) {
                console.error('Error connecting to Cassandra:', err);
                console.log('Waiting for Cassandra to be ready...');
                await new Promise(res => setTimeout(res, 3000));
            }
        }

        // Create the keyspace first
        await this.client.execute(`
            CREATE KEYSPACE IF NOT EXISTS capteur_data
            WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '1'}
        `);

        // Now connect to the keyspace
        await this.client.execute('USE capteur_data');

        await this.client.execute(`
            CREATE TABLE IF NOT EXISTS ingestion_data (
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