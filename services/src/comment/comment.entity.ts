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

  @Column({ type: 'varchar', length: 36, nullable: true })
  contentId: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  userId: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'int', default: 0 })
  likes: number;

  @CreateDateColumn()
  createdAt: Date;
}
