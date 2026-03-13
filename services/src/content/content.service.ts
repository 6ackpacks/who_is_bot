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

  // Real vote-based percentages (always calculated for reference)
  const realAiPercent = totalVotes > 0 ? Math.round((aiVotes / totalVotes) * 100) : 50;
  const realHumanPercent = totalVotes > 0 ? Math.round((humanVotes / totalVotes) * 100) : 50;

  // Determine display percentages based on statsSource
  const statsSource = content.statsSource ?? 'real';
  let displayAiPercent: number;
  let displayHumanPercent: number;

  if (
    statsSource === 'manual' &&
    content.manualAiPercent !== null &&
    content.manualAiPercent !== undefined &&
    content.manualHumanPercent !== null &&
    content.manualHumanPercent !== undefined
  ) {
    displayAiPercent = content.manualAiPercent;
    displayHumanPercent = content.manualHumanPercent;
  } else {
    displayAiPercent = realAiPercent;
    displayHumanPercent = realHumanPercent;
  }

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
    // 前端需要的计算字段（保留兼容旧字段）
    aiPercentage: realAiPercent,
    humanPercentage: realHumanPercent,
    correctPercentage: totalVotes > 0 ? Math.round((correctVotes / totalVotes) * 100) : 0,
    // 新增：全网判断数据来源控制字段
    statsSource,
    manualAiPercent: content.manualAiPercent ?? null,
    manualHumanPercent: content.manualHumanPercent ?? null,
    manualTotalVotes: content.manualTotalVotes ?? null,
    displayAiPercent,
    displayHumanPercent,
    displayTotalVotes: content.manualTotalVotes ?? totalVotes,
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
