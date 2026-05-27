// users/entities/user.entity.ts
import { Entity, Column, OneToMany, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Passkey } from '../../auth/entities/passkey.entity';
import { WebauthnChallenge } from '../../auth/entities/webauth-challenge.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: 'active' })
  status: string;

  // ✅ Agregado: columna de fecha de creación
  @CreateDateColumn()
  createdAt: Date;

  // Relaciones con passkeys (opcional, solo si quieres acceder desde el usuario)
  @OneToMany(() => Passkey, passkey => passkey.user)
  passkeys: Passkey[];

  @OneToMany(() => WebauthnChallenge, challenge => challenge.user)
  challenges: WebauthnChallenge[];
}