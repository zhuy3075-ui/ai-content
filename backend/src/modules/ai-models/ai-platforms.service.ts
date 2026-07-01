import { BadRequestException, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';
import { AiClientService } from './ai-client.service';
import { CAPABILITY_PRESETS, PLATFORM_PRESETS, PROTOCOL_TYPES } from './model-presets';

type PlatformRecord = {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  enabled: boolean;
  config?: unknown;
  createdAt: Date;
  updatedAt: Date;
  models?: unknown[];
};

function maskApiKey(apiKey?: string | null) {
  if (!apiKey) {
    return '';
  }

  if (apiKey.length <= 8) {
    return `${apiKey.slice(0, 2)}****`;
  }

  return `${apiKey.slice(0, 4)}${'*'.repeat(Math.min(apiKey.length - 8, 24))}${apiKey.slice(-4)}`;
}

export function toSafePlatform<T extends PlatformRecord>(platform: T) {
  const { apiKey, ...safePlatform } = platform;
  return {
    ...safePlatform,
    hasApiKey: Boolean(apiKey),
    apiKeyMasked: maskApiKey(apiKey),
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
      return maybeMessage;
    }
  }

  return '未知错误';
}

@Injectable()
export class AiPlatformsService {
  constructor(
    private prisma: PrismaService,
    private aiClientService: AiClientService,
  ) {}

  async findAll() {
    const platforms = await this.prisma.aIPlatform.findMany({
      include: { models: true },
      orderBy: { createdAt: 'desc' },
    });

    return platforms.map(toSafePlatform);
  }

  async findOne(id: string) {
    const platform = await this.prisma.aIPlatform.findUnique({
      where: { id },
      include: { models: true },
    });
    if (!platform) throw new NotFoundException('AI 平台不存在');
    return toSafePlatform(platform);
  }

  async create(dto: CreatePlatformDto) {
    try {
      const platform = await this.prisma.aIPlatform.create({ data: dto });
      return toSafePlatform(platform);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('平台名称已存在');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdatePlatformDto) {
    await this.findOne(id);
    const data = { ...dto };
    if (typeof data.apiKey === 'string' && data.apiKey.trim() === '') {
      delete data.apiKey;
    }

    const platform = await this.prisma.aIPlatform.update({ where: { id }, data });
    this.aiClientService.clearClient(id);
    return toSafePlatform(platform);
  }

  async remove(id: string) {
    await this.findOne(id);
    const platform = await this.prisma.aIPlatform.delete({ where: { id } });
    this.aiClientService.clearClient(id);
    return toSafePlatform(platform);
  }

  getPresets() {
    return {
      providers: PLATFORM_PRESETS,
      capabilities: CAPABILITY_PRESETS,
      protocolTypes: PROTOCOL_TYPES,
    };
  }

  async findRemoteModels(id: string) {
    const platform = await this.prisma.aIPlatform.findUnique({ where: { id } });
    if (!platform) {
      throw new NotFoundException('AI 平台不存在');
    }

    if (!platform.enabled) {
      throw new BadRequestException('AI 平台已禁用，无法拉取模型列表');
    }

    if (!platform.apiKey) {
      throw new BadRequestException('AI 平台未配置 API Key，无法拉取模型列表');
    }

    try {
      const client = await this.aiClientService.getClient(id);
      const result = await client.models.list();
      const models = (result.data || [])
        .map((model) => model.id)
        .filter((modelId): modelId is string => Boolean(modelId))
        .map((modelId) => ({
          name: modelId,
          modelId,
        }));

      return {
        platform: toSafePlatform(platform),
        models,
      };
    } catch (error: unknown) {
      throw new BadRequestException(`模型列表拉取失败：${getErrorMessage(error)}`);
    }
  }
}
