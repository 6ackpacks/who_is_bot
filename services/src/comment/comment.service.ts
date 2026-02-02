import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Content } from '../content/content.entity';
import { User } from '../user/user.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createComment(dto: CreateCommentDto) {
    // 验证内容是否存在
    const content = await this.contentRepository.findOne({
      where: { id: dto.contentId },
    });

    if (!content) {
      throw new NotFoundException('内容不存在');
    }

    // 验证用户或游客ID
    if (!dto.userId && !dto.guestId) {
      throw new BadRequestException('必须提供用户ID或游客ID');
    }

    // 如果提供了用户ID，验证用户是否存在
    if (dto.userId) {
      const user = await this.userRepository.findOne({
        where: { id: dto.userId },
      });

      if (!user) {
        throw new NotFoundException('用户不存在');
      }
    }

    // 如果是回复评论，验证父评论是否存在
    if (dto.parentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { id: dto.parentId },
      });

      if (!parentComment) {
        throw new NotFoundException('父评论不存在');
      }
    }

    // 创建评论
    const comment = this.commentRepository.create({
      contentId: dto.contentId,
      userId: dto.userId || null,
      guestId: dto.guestId || null,
      text: dto.content,
      parentId: dto.parentId || null,
    });

    const savedComment = await this.commentRepository.save(comment);

    // 返回评论详情（包含用户信息）
    return this.getCommentWithDetails(savedComment.id);
  }

  async getCommentsByContentId(contentId: string) {
    // 验证内容是否存在
    const content = await this.contentRepository.findOne({
      where: { id: contentId },
    });

    if (!content) {
      throw new NotFoundException('内容不存在');
    }

    // 获取所有评论
    const comments = await this.commentRepository.find({
      where: { contentId },
      order: { createdAt: 'DESC' },
    });

    // 获取所有相关的用户ID
    const userIds = comments
      .filter(c => c.userId)
      .map(c => c.userId)
      .filter((id, index, self) => self.indexOf(id) === index); // 去重

    // 批量查询用户信息
    const users = userIds.length > 0
      ? await this.userRepository.find({
          where: { id: In(userIds) },
        })
      : [];

    // 创建用户ID到用户对象的映射
    const userMap = new Map(users.map(u => [u.id, u]));

    // 组织评论结构（顶级评论和回复）
    const topLevelComments = comments.filter(c => !c.parentId);
    const replies = comments.filter(c => c.parentId);

    // 为每个顶级评论添加回复
    const commentsWithReplies = topLevelComments.map(comment => ({
      ...this.formatComment(comment, userMap),
      replies: replies
        .filter(r => r.parentId === comment.id)
        .map(r => this.formatComment(r, userMap)),
    }));

    return {
      total: comments.length,
      comments: commentsWithReplies,
    };
  }

  /**
   * 删除评论（带资源所有权验证）
   * @param commentId 评论ID
   * @param userId 当前登录用户ID（从JWT token获取）
   */
  async deleteComment(commentId: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    // 验证资源所有权：只有评论作者可以删除
    if (comment.userId !== userId) {
      throw new ForbiddenException('无权删除此评论');
    }

    await this.commentRepository.remove(comment);

    return {
      success: true,
      message: '评论已删除',
    };
  }

  async likeComment(commentId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    comment.likes += 1;
    await this.commentRepository.save(comment);

    return {
      success: true,
      likes: comment.likes,
    };
  }

  private async getCommentWithDetails(commentId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    // 如果有用户ID，查询用户信息
    let user = null;
    if (comment.userId) {
      user = await this.userRepository.findOne({
        where: { id: comment.userId },
      });
    }

    const userMap = user ? new Map([[user.id, user]]) : new Map();
    return this.formatComment(comment, userMap);
  }

  private formatComment(comment: Comment, userMap: Map<string, any>) {
    const user = comment.userId ? userMap.get(comment.userId) : null;

    return {
      id: comment.id,
      contentId: comment.contentId,
      content: comment.text,
      likes: comment.likes,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: user
        ? {
            id: user.id,
            nickname: user.nickname,
            avatar: user.avatar,
            level: user.level,
          }
        : null,
      isGuest: !comment.userId,
      guestId: comment.guestId,
    };
  }
}
