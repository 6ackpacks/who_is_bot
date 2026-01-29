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
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  /**
   * 创建评论
   * POST /comments
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createComment(@Body() dto: CreateCommentDto) {
    const comment = await this.commentService.createComment(dto);
    return {
      success: true,
      message: '评论发表成功',
      data: comment,
    };
  }

  /**
   * 获取指定内容的所有评论
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
   * 删除评论
   * DELETE /comments/:id
   */
  @Delete(':id')
  async deleteComment(
    @Param('id') commentId: string,
    @Query('userId') userId?: string,
    @Query('guestId') guestId?: string,
  ) {
    const result = await this.commentService.deleteComment(
      commentId,
      userId,
      guestId,
    );
    return result;
  }

  /**
   * 点赞评论
   * POST /comments/:id/like
   */
  @Post(':id/like')
  async likeComment(@Param('id') commentId: string) {
    const result = await this.commentService.likeComment(commentId);
    return result;
  }
}
