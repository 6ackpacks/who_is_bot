import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class UploadSignatureDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'])
  contentType: string;
}
