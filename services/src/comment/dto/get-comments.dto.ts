import { IsString, IsNotEmpty } from 'class-validator';

export class GetCommentsDto {
  @IsString()
  @IsNotEmpty()
  contentId: string;
}
