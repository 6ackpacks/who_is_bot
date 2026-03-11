import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('uploaded_files')
export class UploadedFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  key: string;

  @Column({ type: 'varchar', length: 1000 })
  url: string;

  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @Column({ name: 'content_type', type: 'varchar', length: 100 })
  contentType: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column({ name: 'reference_count', type: 'int', default: 0 })
  referenceCount: number;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;
}
