import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content } from './content.entity';
import { Comment } from './comment.entity';
import { CreateContentDto } from './dto/create-content.dto';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async findAll(): Promise<Content[]> {
    return this.contentRepository.find({
      relations: ['author', 'comments', 'comments.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Content> {
    return this.contentRepository.findOne({
      where: { id },
      relations: ['author', 'comments', 'comments.user'],
    });
  }

  async create(createContentDto: CreateContentDto): Promise<Content> {
    const content = this.contentRepository.create(createContentDto);
    return this.contentRepository.save(content);
  }

  async getFeed(limit: number = 10): Promise<Content[]> {
    return this.contentRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async remove(id: string): Promise<void> {
    await this.contentRepository.delete(id);
  }
}
