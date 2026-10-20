import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";

export enum AccionHistorialLicitacion {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",

  DOCUMENT_CREATE = "DOCUMENT_CREATE",
  DOCUMENT_UPDATE = "DOCUMENT_UPDATE",
  DOCUMENT_DELETE = "DOCUMENT_DELETE",

  GRABACION_CREATE = "GRABACION_CREATE",
}

@Entity("licitacion_historial")
@Index(["licitacionId", "createdAt"])
export class LicitacionHistorial {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "licitacion_id", type: "uuid" })
  licitacionId: string;

  @Column({ name: "usuario_id", type: "uuid", nullable: true })
  usuarioId?: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "usuario_id" })
  usuario?: User | null;

  @Column({
    type: "enum",
    enum: AccionHistorialLicitacion,
  })
  accion: AccionHistorialLicitacion;

  @Column({ type: "jsonb", name: "valores_anteriores", nullable: true })
  valoresAnteriores?: Record<string, unknown> | null;

  @Column({ type: "jsonb", name: "valores_nuevos", nullable: true })
  valoresNuevos?: Record<string, unknown> | null;

  @Column({ type: "jsonb", name: "campos_modificados", nullable: true })
  camposModificados?: Record<string, unknown> | null;

  @Column({
    name: "ip_address",
    type: "varchar",
    length: 45,
    nullable: true,
  })
  ipAddress?: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
