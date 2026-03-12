import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('content')
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  type: string;

  @Column({ type: 'text', nullable: true })
  url: string;

  @Column({ type: 'text', nullable: true })
  text: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'is_bot', type: 'boolean' })
  isAi: boolean;

  @Column({ name: 'modelTag', type: 'varchar', length: 100, nullable: true })
  modelTag: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  provider: string;

  @Column({ name: 'deceptionRate', type: 'float' })
  deceptionRate: number;

  @Column({ type: 'text' })
  explanation: string;

  @Column({ name: 'totalVotes', type: 'int', default: 0 })
  totalVotes: number;

  @Column({ name: 'aiVotes', type: 'int', default: 0 })
  aiVotes: number;

  @Column({ name: 'humanVotes', type: 'int', default: 0 })
  humanVotes: number;

  @Column({ name: 'correctVotes', type: 'int', default: 0 })
  correctVotes: number;

  @ManyToOne(() => User, user => user.contents, { nullable: true })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
