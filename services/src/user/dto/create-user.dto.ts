import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  nickname: string;

  @IsString()
  uid: string;

  @IsOptional()
  @IsNumber()
  level?: number;

  @IsOptional()
  @IsString()
  avatar?: string;
}
