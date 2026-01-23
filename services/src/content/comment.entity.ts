import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { Content } from './content.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'int', default: 0 })
  likes: number;

  @ManyToOne(() => User, user => user.comments)
  user: User;

  @ManyToOne(() => Content, content => content.comments)
  content: Content;

  @CreateDateColumn()
  createdAt: Date;
}
