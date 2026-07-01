import { BadRequestException, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { AiClientService } from './ai-client.service';
import { BulkCreateModelsDto } from './dto/bulk-create-models.dto';
import { toSafePlatform } from './ai-platforms.service';

@Injectable()
export class AiModelsService {
  constructor(
    private prisma: PrismaService,
    private aiClientService: AiClientService
  ) { }

  async findAll(platformId?: string) {
    const where = platformId ? { platformId } : {};
    const models = await this.prisma.aIModel.findMany({
      where,
      include: { platform: true },
      orderBy: { createdAt: 'desc' },
    });
    return models.map((model) => this.toSafeModel(model));
  }

  async findOne(id: string) {
    const model = await this.prisma.aIModel.findUnique({
      where: { id },
      include: { platform: true },
    });
    if (!model) throw new NotFoundException('AI 模型不存在');
    return this.toSafeModel(model);
  }

  async create(dto: CreateModelDto) {
    try {
      const model = await this.prisma.aIModel.create({
        data: dto,
        include: { platform: true },
      });
      return this.toSafeModel(model);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('该平台下已存在相同的模型 ID');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateModelDto) {
    await this.findOne(id);
    const model = await this.prisma.aIModel.update({
      where: { id },
      data: dto,
      include: { platform: true },
    });
    return this.toSafeModel(model);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.aIModel.delete({ where: { id } });
  }

  async bulkCreate(dto: BulkCreateModelsDto) {
    const platform = await this.prisma.aIPlatform.findUnique({
      where: { id: dto.platformId },
    });
    if (!platform) {
      throw new NotFoundException('AI 平台不存在');
    }

    if (!Array.isArray(dto.models) || dto.models.length === 0) {
      throw new BadRequestException('待导入模型列表不能为空');
    }

    const created: unknown[] = [];
    const skipped: Array<{ name: string; modelId: string; reason: string }> = [];
    const seenModelIds = new Set<string>();

    for (const item of dto.models) {
      const modelId = item.modelId.trim();
      const name = item.name.trim() || modelId;
      if (!modelId) {
        throw new BadRequestException('模型 ID 不能为空');
      }

      if (seenModelIds.has(modelId)) {
        skipped.push({ name, modelId, reason: '重复选择' });
        continue;
      }
      seenModelIds.add(modelId);

      const existing = await this.prisma.aIModel.findUnique({
        where: {
          platformId_modelId: {
            platformId: dto.platformId,
            modelId,
          },
        },
      });

      if (existing) {
        skipped.push({ name, modelId, reason: '已存在' });
        continue;
      }

      const model = await this.prisma.aIModel.create({
        data: {
          name,
          modelId,
          platformId: dto.platformId,
        },
        include: { platform: true },
      });
      created.push(this.toSafeModel(model));
    }

    return {
      created,
      skipped,
      createdCount: created.length,
      skippedCount: skipped.length,
    };
  }

  async testConnection(platformId: string, modelId: string) {
    if (!platformId || !modelId) {
      return { success: false, message: '平台ID和模型ID不能为空' };
    }
    try {
      const client = await this.aiClientService.getClient(platformId);
      const response: any = await client.chat.completions.create({
        model: modelId,
        messages: [{ role: 'user', content: '你好，如果你能看到这句话，请回复：测试通过。只回复四个字即可。' }],
      });

      // 检查返回内容是否符合 OpenAI 规范格式
      if (!response || typeof response !== 'object' || !response.choices) {
        return {
          success: false,
          message: '接口返回格式异常（如返回了网页或纯文本）。请检查平台的 Base URL 是否正确，通常需要填写到 API 版本路径。'
        };
      }

      const reply = response.choices[0]?.message?.content || JSON.stringify(response);
      return { success: true, message: '测试通过', reply: reply };
    } catch (error: any) {
      return { success: false, message: `测试失败: ${error.message}` };
    }
  }

  private toSafeModel<T extends { platform?: any }>(model: T) {
    if (!model.platform) {
      return model;
    }

    return {
      ...model,
      platform: toSafePlatform(model.platform),
    };
  }
}
