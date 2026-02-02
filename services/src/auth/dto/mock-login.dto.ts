import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';

export class MockLoginDto {
  @IsString()
  @IsNotEmpty({ message: '昵称不能为空' })
  @MinLength(2, { message: '昵称至少需要 2 个字符' })
  @MaxLength(20, { message: '昵称不能超过 20 个字符' })
  @Transform(({ value }) => {
    // Basic HTML sanitization - strip all HTML tags
    if (typeof value === 'string') {
      return value.replace(/<[^>]*>/g, '').trim();
    }
    return value;
  })
  nickname: string;

  @IsString()
  @IsOptional()
  @IsUrl({}, { message: '头像必须是有效的 URL' })
  avatar?: string;
}
