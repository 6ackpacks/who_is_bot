import {
  Controller,
  Get,
  Delete,
  Post,
  Query,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminCommentService } from './admin-comment.service';
import { AdminGuard } from './guards/admin.guard';

@Controller('admin/comments')
@UseGuards(AdminGuard)
export class AdminCommentController {
  constructor(private readonly adminCommentService: AdminCommentService) {}

  /**
   * 获取评论列表（分页、筛选、搜索）
   * GET /admin/comments?page=1&limit=20&contentId=&userId=&search=
   */
  @Get()
  async getComments(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('contentId') contentId?: string,
    @Query('userId') userId?: string,
    @Query('search') search?: string,
  ) {
    const result = await this.adminCommentService.getComments({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      contentId,
      userId,
      search,
    });

    return {
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  /**
   * 获取评论详情（包含回复）
   * GET /admin/comments/:id
   */
  @Get(':id')
  async getCommentDetail(@Param('id') id: string) {
    const result = await this.adminCommentService.getCommentDetail(id);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 删除评论（支持级联删除）
   * DELETE /admin/comments/:id?cascade=true
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteComment(
    @Param('id') id: string,
  ) {
    const result = await this.adminCommentService.deleteComment(id);
    return {
      success: true,
      message: result.message,
      deletedCount: result.deletedCount,
    };
  }

  /**
   * 批量删除评论
   * POST /admin/comments/batch-delete
   */
  @Post('batch-delete')
  @HttpCode(HttpStatus.OK)
  async batchDeleteComments(@Body() body: { ids: string[] }) {
    const result = await this.adminCommentService.batchDeleteComments(body.ids);
    return {
      success: true,
      message: '批量删除成功',
      deletedCount: result.deletedCount,
    };
  }
}
