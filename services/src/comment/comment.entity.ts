import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'content_id', type: 'varchar', length: 36 })
  contentId: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36, nullable: true })
  userId: string;

  @Column({ name: 'guest_id', type: 'varchar', length: 50, nullable: true })
  guestId: string;

  @Column({ name: 'content', type: 'text' })
  text: string;

  @Column({ type: 'int', default: 0 })
  likes: number;

  @Column({ name: 'parent_id', type: 'varchar', length: 36, nullable: true })
  parentId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
