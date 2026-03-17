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

  // 父评论 ID（varchar 与 comments.id 类型一致），NULL 表示顶层评论
  @Column({ name: 'parentId', type: 'varchar', length: 36, nullable: true, default: null })
  parentId: string | null;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}
