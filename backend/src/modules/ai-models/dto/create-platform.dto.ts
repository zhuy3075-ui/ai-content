import { IsString, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlatformDto {
  @ApiProperty({ description: '平台名称', example: 'DeepSeek' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'API 基础 URL', example: '<provider-api-base>/v1' })
  @IsString()
  @IsNotEmpty()
  baseUrl: string;

  @ApiProperty({ description: 'API 密钥' })
  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @ApiPropertyOptional({ description: '是否启用', default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
