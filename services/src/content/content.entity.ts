import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';
import { Comment } from './comment.entity';

@Entity('content')
export class Content {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 20 })
  type: string; // 'text', 'image', 'video'

  @Column({ type: 'text', nullable: true })
  url: string;

  @Column({ type: 'text', nullable: true })
  text: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'is_bot', type: 'boolean' })
  isAi: boolean;

  @Column({ type: 'varchar', length: 100 })
  modelTag: string;

  @Column({ type: 'varchar', length: 100 })
  provider: string;

  @Column({ type: 'float' })
  deceptionRate: number;

  @Column({ type: 'text' })
  explanation: string;

  @ManyToOne(() => User, user => user.contents)
  author: User;

  @OneToMany(() => Comment, comment => comment.content)
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
