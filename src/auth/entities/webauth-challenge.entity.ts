// auth/entities/webauthn-challenge.entity.ts
import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('webauthn_challenges')
export class WebauthnChallenge {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column({ unique: true })
    challenge: string;

    @Column()
    type: string; // 'registration' | 'authentication'

    @Column()
    expiresAt: Date;

    @Column({ default: false })
    isUsed: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, user => user.challenges)
    user: User;
}