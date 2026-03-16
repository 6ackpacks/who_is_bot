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

  @Column({ name: 'avatarUpdateTime', type: 'varchar', length: 50, nullable: true })
  avatarUpdateTime: string;

  @Column({ type: 'int', nullable: true })
  gender: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  city: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  tags: string; // JSON array stored as string, e.g. '["火眼金睛","AI爱好者"]'

  @Column({ type: 'float', default: 0 })
  accuracy: number;

  @Column({ name: 'totalJudged', type: 'int', default: 0 })
  totalJudged: number;

  @Column({ type: 'int', default: 0 })
  streak: number;

  @Column({ name: 'maxStreak', type: 'int', default: 0 })
  maxStreak: number;

  @Column({ name: 'totalBotsBusted', type: 'int', default: 0 })
  totalBotsBusted: number;

  @Column({ name: 'weeklyAccuracy', type: 'float', default: 0 })
  weeklyAccuracy: number;

  @Column({ name: 'weeklyJudged', type: 'int', default: 0 })
  weeklyJudged: number;

  @Column({ name: 'weeklyCorrect', type: 'int', default: 0 })
  weeklyCorrect: number;

  @Column({ name: 'lastWeekReset', type: 'timestamp', nullable: true })
  lastWeekReset: Date;

  @OneToMany(() => Content, content => content.author)
  contents: Content[];

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
