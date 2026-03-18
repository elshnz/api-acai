import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('noticias')
export class Noticia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  body: string;

  @Column({ nullable: true })
  excerpt: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  category: string;

  @Column({ default: 'published' })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  meta: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
