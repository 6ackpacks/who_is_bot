import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('leaderboard')
export class Leaderboard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  modelName: string;

  @Column({ type: 'varchar', length: 100 })
  company: string;

  @Column({ type: 'varchar', length: 20 })
  type: string; // 'text', 'image', 'video'

  @Column({ type: 'float' })
  deceptionRate: number;

  @Column({ type: 'int' })
  totalTests: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
