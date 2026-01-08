import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity("user")
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column('text', { array: true, default: [] })
    role: string[];

    @Column('text', { array: true, default: [] })
    scopes: string[];

    @CreateDateColumn({ name: "created_at", type: 'timestamp' })
    createdAt: Date;

    @Column({ name: "last_connection", type: 'timestamp', nullable: true, default: null })
    lastConnection?: Date;
}
