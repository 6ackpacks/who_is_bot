import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Content } from '../content/content.entity';

@Entity('judgments')
export class Judgment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Content, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'content_id' })
  content: Content;

  @Column({ name: 'user_choice', type: 'varchar', length: 10 })
  userChoice: string; // 'ai' or 'human'

  @Column({ name: 'is_correct', type: 'boolean' })
  isCorrect: boolean;

  @Column({ name: 'guest_id', type: 'varchar', length: 50, nullable: true })
  guestId: string; // 游客ID（如果未登录）

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
