import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password: string; // bcrypt hashed

  @Column({ type: 'enum', enum: ['super', 'normal'], default: 'normal' })
  role: 'super' | 'normal';

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @Column({ name: 'lastLoginAt', type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
