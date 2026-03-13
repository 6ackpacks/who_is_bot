import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Content } from '../content/content.entity';
import { Comment } from '../comment/comment.entity';
import { QueryContentDto } from './dto/query-content.dto';
import { CreateContentDto } from '../content/dto/create-content.dto';
import { UpdateContentStatsDto } from './dto/update-content-stats.dto';
import { UpdateContentDto } from './dto/update-content.dto';

@Injectable()
export class AdminContentService {
  constructor(
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async findAll(query: QueryContentDto) {
    try {
      const { page = 1, limit = 20, type, isAi, search, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

      // Build where conditions
      const where: any = {};

      if (type) {
        where.type = type;
      }

      if (isAi !== undefined) {
        where.isAi = isAi;
      }

      // For search, we need to use QueryBuilder only for the LIKE query
      let data: Content[];
      let total: number;

      if (search) {
        // Use QueryBuilder only for search with LIKE
        const queryBuilder = this.contentRepository.createQueryBuilder('content');

        // Apply filters
        if (type) {
          queryBuilder.andWhere('content.type = :type', { type });
        }

        if (isAi !== undefined) {
          queryBuilder.andWhere('content.isAi = :isAi', { isAi });
        }

        queryBuilder.andWhere('(content.title LIKE :search OR content.id LIKE :search)', {
          search: `%${search}%`,
        });

        // Apply sorting - use TypeORM entity property names (maps to actual DB columns via @Column name)
        const sortFieldMap = {
          'createdAt': 'content.createdAt',
          'totalVotes': 'content.totalVotes',
          'updatedAt': 'content.updatedAt',
        };
        const sortField = sortFieldMap[sortBy] || 'content.createdAt';
        queryBuilder.orderBy(sortField, sortOrder);

        // Apply pagination
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        // Execute query
        [data, total] = await queryBuilder.getManyAndCount();
      } else {
        // Use find() method for better column name mapping
        const skip = (page - 1) * limit;

        // Build order object
        const order: any = {};
        order[sortBy] = sortOrder;

        [data, total] = await this.contentRepository.findAndCount({
          where,
          order,
          skip,
          take: limit,
        });
      }

      // Calculate accuracy for each content
      const dataWithAccuracy = data.map(content => ({
        ...content,
        accuracy: content.totalVotes > 0 ? (content.correctVotes / content.totalVotes) * 100 : 0,
      }));

      return {
        data: dataWithAccuracy,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error in AdminContentService.findAll:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        query: query,
      });
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const content = await this.contentRepository.findOne({
        where: { id },
        relations: ['author'],
      });

      if (!content) {
        throw new NotFoundException('内容不存在');
      }

      // Get comments for this content
      const comments = await this.commentRepository.find({
        where: { contentId: id },
        order: { createdAt: 'DESC' },
        take: 50,
      });

      return {
        content: {
          ...content,
          accuracy: content.totalVotes > 0 ? (content.correctVotes / content.totalVotes) * 100 : 0,
        },
        comments,
      };
    } catch (error) {
      console.error('Error in AdminContentService.findOne:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        contentId: id,
      });
      throw error;
    }
  }

  async create(createContentDto: CreateContentDto) {
    try {
      const content = this.contentRepository.create(createContentDto);
      return this.contentRepository.save(content);
    } catch (error) {
      console.error('Error in AdminContentService.create:', error);
      throw error;
    }
  }

  async update(id: string, updateContentDto: Partial<CreateContentDto>) {
    try {
      const content = await this.contentRepository.findOne({ where: { id } });

      if (!content) {
        throw new NotFoundException('内容不存在');
      }

      Object.assign(content, updateContentDto);
      return this.contentRepository.save(content);
    } catch (error) {
      console.error('Error in AdminContentService.update:', error);
      throw error;
    }
  }

  async patch(id: string, updateContentDto: UpdateContentDto) {
    try {
      const content = await this.contentRepository.findOne({ where: { id } });

      if (!content) {
        throw new NotFoundException('内容不存在');
      }

      Object.assign(content, updateContentDto);
      return this.contentRepository.save(content);
    } catch (error) {
      console.error('Error in AdminContentService.patch:', error);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const content = await this.contentRepository.findOne({ where: { id } });

      if (!content) {
        throw new NotFoundException('内容不存在');
      }

      // Delete related comments first (due to NO ACTION foreign key constraint)
      await this.commentRepository.delete({ contentId: id });

      // Delete the content (judgments will be cascade deleted automatically)
      await this.contentRepository.remove(content);

      return { success: true, message: '内容已删除' };
    } catch (error) {
      console.error('Error in AdminContentService.remove:', error);
      throw error;
    }
  }

  async batchDelete(ids: string[]) {
    try {
      const contents = await this.contentRepository.find({
        where: { id: In(ids) },
      });

      if (contents.length === 0) {
        throw new NotFoundException('未找到要删除的内容');
      }

      // Delete related comments first (due to NO ACTION foreign key constraint)
      await this.commentRepository.delete({ contentId: In(ids) });

      // Delete the contents (judgments will be cascade deleted automatically)
      await this.contentRepository.remove(contents);

      return {
        success: true,
        deletedCount: contents.length,
        message: `成功删除 ${contents.length} 条内容`,
      };
    } catch (error) {
      console.error('Error in AdminContentService.batchDelete:', error);
      throw error;
    }
  }

  async updateStats(id: string, updateStatsDto: UpdateContentStatsDto) {
    try {
      const content = await this.contentRepository.findOne({ where: { id } });

      if (!content) {
        throw new NotFoundException('内容不存在');
      }

      // Validate real vote stats consistency
      const { totalVotes, aiVotes, humanVotes, correctVotes, statsSource, manualAiPercent, manualHumanPercent } = updateStatsDto;

      if (totalVotes !== undefined && aiVotes !== undefined && humanVotes !== undefined) {
        if (totalVotes !== aiVotes + humanVotes) {
          throw new BadRequestException('总投票数必须等于 AI 投票数 + 人类投票数');
        }
      }

      if (correctVotes !== undefined && totalVotes !== undefined) {
        if (correctVotes > totalVotes) {
          throw new BadRequestException('正确投票数不能大于总投票数');
        }
      }

      // Validate manual stats when switching to manual source
      if (statsSource === 'manual') {
        const aiPct = manualAiPercent !== undefined ? manualAiPercent : content.manualAiPercent;
        const humanPct = manualHumanPercent !== undefined ? manualHumanPercent : content.manualHumanPercent;

        if (aiPct === null || aiPct === undefined || humanPct === null || humanPct === undefined) {
          throw new BadRequestException('切换为预设数据时，AI 占比和真人占比均为必填项');
        }

        if (aiPct + humanPct > 100) {
          throw new BadRequestException('AI 占比与真人占比之和不能超过 100');
        }
      }

      // Update stats (assign only defined fields to avoid overwriting unrelated columns)
      Object.assign(content, updateStatsDto);
      const updatedContent = await this.contentRepository.save(content);

      return {
        ...updatedContent,
        accuracy: updatedContent.totalVotes > 0
          ? (updatedContent.correctVotes / updatedContent.totalVotes) * 100
          : 0,
      };
    } catch (error) {
      console.error('Error in AdminContentService.updateStats:', error);
      throw error;
    }
  }
}
