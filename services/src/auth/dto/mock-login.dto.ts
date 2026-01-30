import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class MockLoginDto {
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}
