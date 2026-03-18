import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pages')
export class Page {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  body: string;

  @Column({ default: 'page' })
  type: string;

  @Column({ default: 'published' })
  status: string;

  @Column({ nullable: true })
  htmlUrl: string;

  @Column({ nullable: true })
  linkUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  meta: Record<string, any>;

  @Column({ default: false })
  showInMenus: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
