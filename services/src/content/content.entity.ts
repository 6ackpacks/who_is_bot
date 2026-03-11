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

  @Column({ name: 'model_tag', type: 'varchar', length: 100, nullable: true })
  modelTag: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  provider: string;

  @Column({ name: 'deception_rate', type: 'float' })
  deceptionRate: number;

  @Column({ type: 'text' })
  explanation: string;

  @Column({ name: 'total_votes', type: 'int', default: 0 })
  totalVotes: number;

  @Column({ name: 'ai_votes', type: 'int', default: 0 })
  aiVotes: number;

  @Column({ name: 'human_votes', type: 'int', default: 0 })
  humanVotes: number;

  @Column({ name: 'correct_votes', type: 'int', default: 0 })
  correctVotes: number;

  @ManyToOne(() => User, user => user.contents, { nullable: true })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
