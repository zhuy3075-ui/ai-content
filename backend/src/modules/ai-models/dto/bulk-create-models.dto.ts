import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkModelItemDto {
  @ApiProperty({ description: '模型显示名称', example: 'DeepSeek Chat' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '模型 ID', example: 'deepseek-chat' })
  @IsString()
  @IsNotEmpty()
  modelId: string;
}

export class BulkCreateModelsDto {
  @ApiProperty({ description: '所属平台 ID' })
  @IsString()
  @IsNotEmpty()
  platformId: string;

  @ApiProperty({ type: [BulkModelItemDto], description: '待导入模型列表' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BulkModelItemDto)
  models: BulkModelItemDto[];
}
