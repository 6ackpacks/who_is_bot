import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { Content } from '../content/content.entity';

@Entity('users')
@Index('IDX_USER_LEADERBOARD', ['accuracy', 'totalJudged'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nickname: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  uid: string;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'text', nullable: true })
  avatar: string;

  @Column({ name: 'avatar_update_time', type: 'varchar', length: 50, nullable: true })
  avatarUpdateTime: string;

  @Column({ type: 'int', nullable: true })
  gender: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  city: string;

  @Column({ type: 'float', default: 0 })
  accuracy: number;

  @Column({ name: 'total_judged', type: 'int', default: 0 })
  totalJudged: number;

  @Column({ type: 'int', default: 0 })
  streak: number;

  @Column({ name: 'max_streak', type: 'int', default: 0 })
  maxStreak: number;

  @Column({ name: 'total_bots_busted', type: 'int', default: 0 })
  totalBotsBusted: number;

  @Column({ name: 'weekly_accuracy', type: 'float', default: 0 })
  weeklyAccuracy: number;

  @Column({ name: 'weekly_judged', type: 'int', default: 0 })
  weeklyJudged: number;

  @Column({ name: 'weekly_correct', type: 'int', default: 0 })
  weeklyCorrect: number;

  @Column({ name: 'last_week_reset', type: 'timestamp', nullable: true })
  lastWeekReset: Date;

  @OneToMany(() => Content, content => content.author)
  contents: Content[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
