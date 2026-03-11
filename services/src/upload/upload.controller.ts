import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile as UploadedFileDecorator,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { UploadSignatureDto } from './dto/upload-signature.dto';
import { AdminGuard } from '../admin/guards/admin.guard';

@Controller('admin/upload')
@UseGuards(AdminGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * 获取上传签名（用于前端直传 OSS）
   * POST /admin/upload/signature
   */
  @Post('signature')
  @HttpCode(HttpStatus.OK)
  async getUploadSignature(@Body() dto: UploadSignatureDto) {
    const result = await this.uploadService.getUploadSignature(
      dto.filename,
      dto.contentType,
    );

    return {
      success: true,
      data: result,
    };
  }

  /**
   * 直接上传文件（服务器中转）
   * POST /admin/upload/file
   */
  @Post('file')
  @UsePipes(new ValidationPipe({
    transform: true,
    whitelist: false,
    forbidNonWhitelisted: false,
  }))
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB
    },
  }))
  async uploadFile(@UploadedFileDecorator() file: Express.Multer.File) {
    if (!file) {
      return {
        success: false,
        message: '请选择要上传的文件',
      };
    }

    const result = await this.uploadService.uploadFile(file);

    return {
      success: true,
      message: '文件上传成功',
      data: result,
    };
  }

  /**
   * 获取文件列表
   * GET /admin/upload/files?page=1&limit=20&type=
   */
  @Get('files')
  async getFiles(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('type') type?: string,
  ) {
    // 验证和转换分页参数
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || isNaN(limitNum)) {
      throw new BadRequestException('分页参数必须是有效的数字');
    }

    const result = await this.uploadService.getFiles(
      pageNum,
      limitNum,
      type,
    );

    return {
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  /**
   * 删除文件
   * DELETE /admin/upload/files/:key
   */
  @Delete('files/:key')
  @HttpCode(HttpStatus.OK)
  async deleteFile(@Param('key') key: string) {
    // URL 解码 key（因为 key 中可能包含特殊字符）
    const decodedKey = decodeURIComponent(key);
    const result = await this.uploadService.deleteFile(decodedKey);

    return {
      success: true,
      message: result.message,
    };
  }
}
