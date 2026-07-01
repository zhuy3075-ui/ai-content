import { IsString, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateModelDto {
  @ApiProperty({ description: '模型显示名称', example: 'DeepSeek V3' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '模型 ID', example: 'deepseek-chat' })
  @IsString()
  @IsNotEmpty()
  modelId: string;

  @ApiProperty({ description: '所属平台 ID' })
  @IsString()
  @IsNotEmpty()
  platformId: string;

  @ApiPropertyOptional({ description: '是否启用', default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
