import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content } from './content.entity';
import { CreateContentDto } from './dto/create-content.dto';

/**
 * 将 Content 实体转换为前端所需的格式，补充计算字段
 */
function formatContent(content: Content): any {
  const totalVotes = content.totalVotes || 0;
  const aiVotes = content.aiVotes || 0;
  const humanVotes = content.humanVotes || 0;
  const correctVotes = content.correctVotes || 0;

  return {
    id: content.id,
    type: content.type,
    url: content.url,
    text: content.text,
    title: content.title,
    isAi: content.isAi,
    modelTag: content.modelTag,
    provider: content.provider,
    deceptionRate: content.deceptionRate,
    explanation: content.explanation,
    totalVotes,
    aiVotes,
    humanVotes,
    correctVotes,
    // 前端需要的计算字段
    aiPercentage: totalVotes > 0 ? Math.round((aiVotes / totalVotes) * 100) : 50,
    humanPercentage: totalVotes > 0 ? Math.round((humanVotes / totalVotes) * 100) : 50,
    correctPercentage: totalVotes > 0 ? Math.round((correctVotes / totalVotes) * 100) : 0,
    createdAt: content.createdAt,
    updatedAt: content.updatedAt,
  };
}

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
  ) {}

  async findAll(): Promise<any[]> {
    const contents = await this.contentRepository.find({
      order: { createdAt: 'DESC' },
    });
    return contents.map(formatContent);
  }

  async findOne(id: string): Promise<any> {
    const content = await this.contentRepository.findOne({
      where: { id },
    });
    if (!content) return null;
    return formatContent(content);
  }

  async create(createContentDto: CreateContentDto): Promise<Content> {
    const content = this.contentRepository.create(createContentDto);
    return this.contentRepository.save(content);
  }

  async getFeed(limit: number = 20, offset: number = 0): Promise<any[]> {
    const contents = await this.contentRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return contents.map(formatContent);
  }

  async remove(id: string): Promise<void> {
    await this.contentRepository.delete(id);
  }
}
