import { NotFoundException } from '@nestjs/common';
import { AiModelsService } from './ai-models.service';

describe('AiModelsService', () => {
  const createdAt = new Date('2026-03-17T00:00:00.000Z');
  const updatedAt = new Date('2026-03-17T00:00:00.000Z');
  const platform = {
    id: 'platform-1',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    apiKey: 'sk-1234567890abcdef',
    enabled: true,
    config: null,
    createdAt,
    updatedAt,
  };

  const createService = () => {
    const prisma = {
      aIPlatform: {
        findUnique: jest.fn(),
      },
      aIModel: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    const aiClientService = {
      getClient: jest.fn(),
    };

    return {
      service: new AiModelsService(prisma as any, aiClientService as any),
      prisma,
    };
  };

  it('批量导入模型时会跳过已存在模型和重复选择', async () => {
    const { service, prisma } = createService();
    prisma.aIPlatform.findUnique.mockResolvedValue(platform);
    prisma.aIModel.findUnique
      .mockResolvedValueOnce({ id: 'existing-model' })
      .mockResolvedValueOnce(null);
    prisma.aIModel.create.mockResolvedValue({
      id: 'model-2',
      name: 'DeepSeek Reasoner',
      modelId: 'deepseek-reasoner',
      platformId: 'platform-1',
      enabled: true,
      createdAt,
      updatedAt,
      platform,
    });

    const result = await service.bulkCreate({
      platformId: 'platform-1',
      models: [
        { name: 'DeepSeek Chat', modelId: 'deepseek-chat' },
        { name: 'DeepSeek Reasoner', modelId: 'deepseek-reasoner' },
        { name: 'DeepSeek Reasoner Copy', modelId: 'deepseek-reasoner' },
      ],
    });

    expect(result.createdCount).toBe(1);
    expect(result.skippedCount).toBe(2);
    expect(result.skipped).toEqual([
      { name: 'DeepSeek Chat', modelId: 'deepseek-chat', reason: '已存在' },
      { name: 'DeepSeek Reasoner Copy', modelId: 'deepseek-reasoner', reason: '重复选择' },
    ]);
    expect(result.created[0].platform).not.toHaveProperty('apiKey');
    expect(prisma.aIModel.create).toHaveBeenCalledTimes(1);
    expect(prisma.aIModel.findUnique).toHaveBeenCalledTimes(2);
  });

  it('批量导入模型时要求平台存在', async () => {
    const { service, prisma } = createService();
    prisma.aIPlatform.findUnique.mockResolvedValue(null);

    await expect(
      service.bulkCreate({
        platformId: 'missing-platform',
        models: [{ name: 'DeepSeek Chat', modelId: 'deepseek-chat' }],
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
