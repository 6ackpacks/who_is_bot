import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Content } from '../content/content.entity';
import { Comment } from '../content/comment.entity';

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

  @Column({ type: 'int', default: 0 })
  streak: number;

  @OneToMany(() => Content, content => content.author)
  contents: Content[];

  @OneToMany(() => Comment, comment => comment.user)
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
