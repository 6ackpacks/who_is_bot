import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'contentId', type: 'varchar', length: 36 })
  contentId: string;

  @Column({ name: 'userId', type: 'varchar', length: 36, nullable: true })
  userId: string;

  // comments 表中实际列名为 text，不是 content
  @Column({ name: 'text', type: 'text' })
  content: string;

  @Column({ type: 'int', default: 0 })
  likes: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}
