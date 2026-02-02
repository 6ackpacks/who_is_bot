import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  /**
   * 创建评论（需要认证）
   * POST /comments
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createComment(
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    // 使用从 token 中提取的真实用户 ID
    const secureDto = {
      ...dto,
      userId: user.userId,
      guestId: undefined, // 已登录用户不使用 guestId
    };
    const comment = await this.commentService.createComment(secureDto);
    return {
      success: true,
      message: '评论发表成功',
      data: comment,
    };
  }

  /**
   * 获取指定内容的所有评论（公开访问）
   * GET /comments?contentId=xxx
   */
  @Get()
  async getComments(@Query('contentId') contentId: string) {
    if (!contentId) {
      return {
        success: false,
        message: '缺少 contentId 参数',
      };
    }

    const result = await this.commentService.getCommentsByContentId(contentId);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 删除评论（需要认证，只能删除自己的评论）
   * DELETE /comments/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Param('id') commentId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const result = await this.commentService.deleteComment(commentId, user.userId);
    return result;
  }

  /**
   * 点赞评论（公开访问）
   * POST /comments/:id/like
   */
  @Post(':id/like')
  async likeComment(@Param('id') commentId: string) {
    const result = await this.commentService.likeComment(commentId);
    return result;
  }
}
