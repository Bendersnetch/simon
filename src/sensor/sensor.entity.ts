import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Sensor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nom: string;

    @Column()
    type: string;

    @Column()
    localisation: string;

    @Column({
        name: 'date_installation',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    dateInstallation: Date

    @Column({default: false})
    status: boolean;
}