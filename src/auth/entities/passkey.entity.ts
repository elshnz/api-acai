// auth/entities/passkey.entity.ts
import { Entity, Column, ManyToOne, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('passkeys')
export class Passkey {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    credentialId: string;

    @Column({ type: 'bytea' })
    publicKey: Buffer;

    @Column()
    counter: number;

    @Column()
    userId: string;

    @Column()
    webauthnUserID: string;

    @Column()
    deviceType: string;

    @Column({ default: false })
    backedUp: boolean;

    @Column({ nullable: true })
    transports: string;

    @Column({ nullable: true })
    aaguid: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, user => user.passkeys)
    user: User;
}