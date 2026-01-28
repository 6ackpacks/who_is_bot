import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { UserAchievement } from './user-achievement.entity';

@Entity('achievements')
export class Achievement {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  icon: string;

  @Column({ type: 'varchar', length: 50 })
  type: string; // 'judgment_count', 'accuracy', 'streak', 'special'

  @Column({ name: 'requirement_value', type: 'int', nullable: true })
  requirementValue: number;

  @Column({ type: 'int', default: 0 })
  points: number;

  @OneToMany(() => UserAchievement, userAchievement => userAchievement.achievement)
  userAchievements: UserAchievement[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
