import { IsString, IsNotEmpty, IsOptional, MaxLength, MinLength, IsUUID, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID('4', { message: 'contentId 必须是有效的 UUID' })
  contentId: string;

  @IsString()
  @IsOptional()
  @IsUUID('4', { message: 'userId 必须是有效的 UUID' })
  userId?: string;

  @IsString()
  @IsOptional()
  guestId?: string;

  @IsString()
  @IsNotEmpty({ message: '评论内容不能为空' })
  @MinLength(1, { message: '评论内容至少需要 1 个字符' })
  @MaxLength(500, { message: '评论内容不能超过 500 个字符' })
  @Transform(({ value }) => {
    // Basic HTML sanitization - strip all HTML tags
    if (typeof value === 'string') {
      return value.replace(/<[^>]*>/g, '').trim();
    }
    return value;
  })
  content: string;

  @IsString()
  @IsOptional()
  @IsUUID('4', { message: 'parentId 必须是有效的 UUID' })
  parentId?: string;
}
