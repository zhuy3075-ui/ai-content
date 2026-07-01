import { BadRequestException } from '@nestjs/common';
import { AiPlatformsService } from './ai-platforms.service';

describe('AiPlatformsService', () => {
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
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    const aiClientService = {
      getClient: jest.fn(),
      clearClient: jest.fn(),
    };

    return {
      service: new AiPlatformsService(prisma as any, aiClientService as any),
      prisma,
      aiClientService,
    };
  };

  it('平台列表不会返回明文 API Key', async () => {
    const { service, prisma } = createService();
    prisma.aIPlatform.findMany.mockResolvedValue([{ ...platform, models: [] }]);

    const result = await service.findAll();

    expect(result[0]).not.toHaveProperty('apiKey');
    expect(result[0]).toMatchObject({
      id: 'platform-1',
      hasApiKey: true,
      apiKeyMasked: expect.stringMatching(/^sk-1\*+cdef$/),
    });
  });

  it('编辑平台时空 API Key 会保留旧密钥', async () => {
    const { service, prisma, aiClientService } = createService();
    prisma.aIPlatform.findUnique.mockResolvedValue({ ...platform, models: [] });
    prisma.aIPlatform.update.mockResolvedValue({ ...platform, name: 'DeepSeek Main' });

    await service.update('platform-1', {
      name: 'DeepSeek Main',
      apiKey: '',
    } as any);

    expect(prisma.aIPlatform.update).toHaveBeenCalledWith({
      where: { id: 'platform-1' },
      data: { name: 'DeepSeek Main' },
    });
    expect(aiClientService.clearClient).toHaveBeenCalledWith('platform-1');
  });

  it('可以通过已保存平台密钥在线拉取远端模型列表', async () => {
    const { service, prisma, aiClientService } = createService();
    const list = jest.fn().mockResolvedValue({
      data: [{ id: 'deepseek-chat' }, { id: undefined }, { id: 'deepseek-reasoner' }],
    });
    prisma.aIPlatform.findUnique.mockResolvedValue(platform);
    aiClientService.getClient.mockResolvedValue({ models: { list } });

    const result = await service.findRemoteModels('platform-1');

    expect(aiClientService.getClient).toHaveBeenCalledWith('platform-1');
    expect(result.platform).not.toHaveProperty('apiKey');
    expect(result.models).toEqual([
      { name: 'deepseek-chat', modelId: 'deepseek-chat' },
      { name: 'deepseek-reasoner', modelId: 'deepseek-reasoner' },
    ]);
  });

  it('平台未配置 API Key 时不会尝试请求远端模型列表', async () => {
    const { service, prisma, aiClientService } = createService();
    prisma.aIPlatform.findUnique.mockResolvedValue({ ...platform, apiKey: '' });

    await expect(service.findRemoteModels('platform-1')).rejects.toBeInstanceOf(BadRequestException);
    expect(aiClientService.getClient).not.toHaveBeenCalled();
  });
});
