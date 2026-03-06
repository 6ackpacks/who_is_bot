import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Content } from '../content/content.entity';

@Entity('judgments')
export class Judgment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36, nullable: true })
  userId: string;

  @Column({ name: 'content_id', type: 'varchar', length: 36 })
  contentId: string;

  @Column({ name: 'user_choice', type: 'varchar', length: 10 })
  userChoice: string; // 'ai' or 'human'

  @Column({ name: 'is_correct', type: 'boolean' })
  isCorrect: boolean;

  @Column({ name: 'guest_id', type: 'varchar', length: 50, nullable: true })
  guestId: string; // 游客ID（如果未登录）

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // 关联到Content实体，用于JOIN查询优化
  @ManyToOne(() => Content, { nullable: true })
  @JoinColumn({ name: 'content_id' })
  content: Content;
}
