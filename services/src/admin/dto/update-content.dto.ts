import { IsString, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class UpdateContentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsBoolean()
  isAi?: boolean;

  @IsOptional()
  @IsNumber()
  deceptionRate?: number;

  @IsOptional()
  @IsString()
  modelTag?: string;

  @IsOptional()
  @IsString()
  provider?: string;
}
