import { Entity, Column, ManyToOne, CreateDateColumn, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import { User } from "./user.entity";

@Entity("user_invitations")
export class UserInvitation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  tokenHash: string;

  @Column({ type: "timestamptz" })
  expiresAt: Date;

  @Column({ default: false })
  used: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
