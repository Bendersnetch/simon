import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert } from "typeorm";
import type { Point } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity()
export class Sensor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    nom: string;

    @Column({
        nullable: false,
        unique: true
    })
    origin: string;

    @Column({ name: "api_key" })
    apiKey: string;

    @Column({ nullable: false })
    type: string;

    @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326, nullable: false })
    localisation: Point;

    @Column({
        name: 'date_installation',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    dateInstallation: Date;

    @Column({default: false})
    status: boolean;

    @BeforeInsert()
    async hashApiKey() {
        this.apiKey = await bcrypt.hash(this.apiKey, 10);
    }
}