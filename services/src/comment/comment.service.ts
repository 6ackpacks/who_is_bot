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

    // 验证用户ID（必须提供）
    if (!dto.userId) {
      throw new BadRequestException('必须提供用户ID');
    }

    // 验证用户是否存在
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 创建评论
    const comment = this.commentRepository.create({
      contentId: dto.contentId,
      userId: dto.userId,
      text: dto.content,
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

    // 格式化所有评论（扁平结构，无层级）
    const formattedComments = comments.map(comment => this.formatComment(comment, userMap));

    return {
      total: comments.length,
      comments: formattedComments,
    };
  }

  async getCommentsByUserId(userId: string) {
    // 验证用户是否存在
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      // 用户不存在时返回空列表，而不是抛出错误
      // 这样可以避免新用户看到404错误
      return {
        total: 0,
        comments: [],
      };
    }

    // 获取用户的所有评论
    const comments = await this.commentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    // 获取所有相关的内容ID
    const contentIds = comments
      .map(c => c.contentId)
      .filter((id, index, self) => self.indexOf(id) === index); // 去重

    // 批量查询内容信息
    const contents = contentIds.length > 0
      ? await this.contentRepository.find({
          where: { id: In(contentIds) },
        })
      : [];

    // 创建内容ID到内容对象的映射
    const contentMap = new Map(contents.map(c => [c.id, c]));

    // 创建用户映射（只包含当前用户）
    const userMap = new Map([[user.id, user]]);

    // 格式化评论并附加内容信息
    const formattedComments = comments.map(comment => {
      const content = contentMap.get(comment.contentId);
      return {
        ...this.formatComment(comment, userMap),
        content: content ? {
          id: content.id,
          title: content.title,
          type: content.type,
          url: content.url,
          text: content.text,
        } : null,
      };
    });

    return {
      total: comments.length,
      comments: formattedComments,
    };
  }

  async getUserCommentStats(userId: string) {
    // 验证用户是否存在
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      // 用户不存在时返回默认值，而不是抛出错误
      // 这样可以避免新用户或未发表评论的用户看到404错误
      return {
        totalComments: 0,
        totalLikes: 0,
      };
    }

    // 获取用户的所有评论
    const comments = await this.commentRepository.find({
      where: { userId },
      select: ['likes'],
    });

    // 计算总点赞数
    const totalLikes = comments.reduce((sum, comment) => sum + comment.likes, 0);

    return {
      totalComments: comments.length,
      totalLikes,
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

  /**
   * 点赞评论
   * 使用原子操作避免并发竞态条件
   */
  async likeComment(commentId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    // 使用原子递增操作，避免读-改-写的竞态条件
    await this.commentRepository.increment(
      { id: commentId },
      'likes',
      1
    );

    // 获取更新后的点赞数
    const updatedComment = await this.commentRepository.findOne({
      where: { id: commentId },
      select: ['likes'],
    });

    return {
      success: true,
      likes: updatedComment.likes,
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

    // 生成默认头像
    const getDefaultAvatar = (nickname: string) => {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nickname || 'User')}`;
    };

    // 检查avatar是否有效（排除测试URL和无效URL）
    const isValidAvatar = (avatar: string | null) => {
      if (!avatar) return false;
      if (avatar.includes('example.com')) return false; // 排除测试URL
      if (avatar.includes('placeholder.com')) return false; // 排除占位符URL
      return true;
    };

    return {
      id: comment.id,
      contentId: comment.contentId,
      content: comment.text,
      likes: comment.likes,
      createdAt: comment.createdAt,
      user: user
        ? {
            id: user.id,
            nickname: user.nickname,
            avatar: isValidAvatar(user.avatar) ? user.avatar : getDefaultAvatar(user.nickname),
            level: user.level,
          }
        : null,
    };
  }
}
