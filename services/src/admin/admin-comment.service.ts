import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Comment } from '../comment/comment.entity';
import { User } from '../user/user.entity';
import { Content } from '../content/content.entity';

interface GetCommentsParams {
  page: number;
  limit: number;
  contentId?: string;
  userId?: string;
  search?: string;
}

@Injectable()
export class AdminCommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
  ) {}

  /**
   * 获取评论列表（分页、筛选、搜索）
   */
  async getComments(params: GetCommentsParams) {
    const { page, limit, contentId, userId, search } = params;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};
    if (contentId) {
      where.contentId = contentId;
    }
    if (userId) {
      where.userId = userId;
    }
    if (search) {
      where.content = Like(`%${search}%`);
    }

    // 查询评论
    const [comments, total] = await this.commentRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    // 获取关联的用户和内容信息
    const userIds = comments
      .filter(c => c.userId)
      .map(c => c.userId)
      .filter((id, index, self) => self.indexOf(id) === index);

    const contentIds = comments
      .map(c => c.contentId)
      .filter((id, index, self) => self.indexOf(id) === index);

    const users = userIds.length > 0
      ? await this.userRepository.find({ where: { id: In(userIds) } })
      : [];

    const contents = contentIds.length > 0
      ? await this.contentRepository.find({ where: { id: In(contentIds) } })
      : [];

    const userMap = new Map(users.map(u => [u.id, u]));
    const contentMap = new Map(contents.map(c => [c.id, c]));

    // 格式化数据
    const data = comments.map(comment => {
      const user = comment.userId ? userMap.get(comment.userId) : null;
      const content = contentMap.get(comment.contentId);

      return {
        id: comment.id,
        content: comment.content,
        contentId: comment.contentId,
        contentTitle: content?.title || '未知内容',
        userId: comment.userId,
        user: user
          ? {
              id: user.id,
              nickname: user.nickname,
              avatar: user.avatar,
            }
          : null,
        likes: comment.likes,
        createdAt: comment.createdAt,
      };
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * 获取评论详情（包含回复）
   */
  async getCommentDetail(id: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    // 获取用户信息
    let user = null;
    if (comment.userId) {
      user = await this.userRepository.findOne({
        where: { id: comment.userId },
      });
    }

    // 获取内容信息
    const content = await this.contentRepository.findOne({
      where: { id: comment.contentId },
    });

    return {
      comment: {
        id: comment.id,
        content: comment.content,
        contentId: comment.contentId,
        contentTitle: content?.title || '未知内容',
        userId: comment.userId,
        user: user
          ? {
              id: user.id,
              nickname: user.nickname,
              avatar: user.avatar,
            }
          : null,
        likes: comment.likes,
        createdAt: comment.createdAt,
      },
    };
  }

  /**
   * 删除评论
   */
  async deleteComment(id: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    // 删除评论
    await this.commentRepository.remove(comment);

    return {
      message: '评论已删除',
      deletedCount: 1,
    };
  }

  /**
   * 批量删除评论
   */
  async batchDeleteComments(ids: string[]) {
    if (!ids || ids.length === 0) {
      return { deletedCount: 0 };
    }

    const comments = await this.commentRepository.find({
      where: { id: In(ids) },
    });

    if (comments.length === 0) {
      return { deletedCount: 0 };
    }

    // 删除所有评论
    await this.commentRepository.remove(comments);

    return {
      deletedCount: comments.length,
    };
  }

}
