import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  urlInterno: string;

  @Column({ default: 0 })
  order: number;

  @Column({ nullable: true })
  parentId: number;

  @Column({ default: true })
  showInMenus: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
