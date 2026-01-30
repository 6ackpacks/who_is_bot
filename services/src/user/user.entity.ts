import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Content } from '../content/content.entity';

@Entity('users')
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

  @Column({ type: 'float', default: 0 })
  accuracy: number;

  @Column({ type: 'int', default: 0 })
  totalJudged: number;

  @Column({ name: 'correct_count', type: 'int', default: 0 })
  correctCount: number;

  @Column({ type: 'int', default: 0 })
  streak: number;

  @Column({ type: 'int', default: 0 })
  maxStreak: number;

  @Column({ type: 'int', default: 0 })
  totalBotsBusted: number;

  @Column({ type: 'float', default: 0 })
  weeklyAccuracy: number;

  @Column({ type: 'int', default: 0 })
  weeklyJudged: number;

  @Column({ type: 'int', default: 0 })
  weeklyCorrect: number;

  @Column({ type: 'timestamp', nullable: true })
  lastWeekReset: Date;

  @OneToMany(() => Content, content => content.author)
  contents: Content[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
