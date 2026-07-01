import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import OpenAI from 'openai';
import { QiniuService } from '../storage/qiniu.service';

@Injectable()
export class AiClientService {
  private readonly logger = new Logger(AiClientService.name);
  private clients: Map<string, OpenAI> = new Map();

  constructor(
    private prisma: PrismaService,
    private readonly qiniuService: QiniuService,
  ) { }

  // 获取或创建 AI 客户端
  async getClient(platformId: string): Promise<OpenAI> {
    if (this.clients.has(platformId)) {
      return this.clients.get(platformId)!;
    }

    const platform = await this.prisma.aIPlatform.findUnique({
      where: { id: platformId },
    });

    if (!platform || !platform.enabled) {
      throw new Error('AI 平台未配置或已禁用');
    }

    // 自动修正并兼容中转平台的 Base URL 填写形式
    // 很多平台会把 Base URL 写到 API 版本路径，或者误写到 /chat/completions。
    // openai sdk 内部会自动在 baseURL 后面追加 /chat/completions
    let safeBaseUrl = platform.baseUrl.trim();
    if (safeBaseUrl.endsWith('/chat/completions')) {
      safeBaseUrl = safeBaseUrl.replace('/chat/completions', '');
    }
    // 移除末尾的斜杠
    safeBaseUrl = safeBaseUrl.replace(/\/$/, '');

    // 如果没有自带 /v1 且没有说明具体版本路径（通常用于判断那些忘记写 v1 的），由于无法 100% 确定，这里只把明确错误的后缀移除，尽量相信用户的输入
    // OpenAI 兼容 SDK 通常要求 baseURL 指向到 API 版本路径。

    const client = new OpenAI({
      apiKey: platform.apiKey,
      baseURL: safeBaseUrl,
    });

    this.clients.set(platformId, client);
    return client;
  }

  // 清除客户端缓存（平台配置更新时调用）
  clearClient(platformId: string) {
    this.clients.delete(platformId);
  }

  // 将 SDK/平台抛出的多种错误形态压平成可展示字符串
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    if (typeof error === 'object' && error !== null) {
      const maybeMessage = (error as { message?: unknown }).message;
      if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
        return maybeMessage;
      }

      const maybeError = (error as { error?: { message?: unknown } }).error?.message;
      if (typeof maybeError === 'string' && maybeError.trim()) {
        return maybeError;
      }
    }

    return '未知错误';
  }

  // 非流式生成（用于评分、摘要等）
  async generate(
    modelId: string,
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: { temperature?: number; maxTokens?: number },
  ): Promise<string> {
    const model = await this.prisma.aIModel.findUnique({
      where: { id: modelId },
      include: { platform: true },
    });

    if (!model) throw new Error('AI 模型不存在');

    const client = await this.getClient(model.platformId);

    this.logger.log(`调用 AI 模型: ${model.name} (${model.modelId})`);

    const response = await client.chat.completions.create({
      model: model.modelId,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4000,
    });

    return response.choices[0]?.message?.content || '';
  }

  // 流式生成（用于文章创作）
  async *streamGenerate(
    modelId: string,
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: { temperature?: number; maxTokens?: number },
  ): AsyncGenerator<string> {
    const model = await this.prisma.aIModel.findUnique({
      where: { id: modelId },
      include: { platform: true },
    });

    if (!model) throw new Error('AI 模型不存在');

    const client = await this.getClient(model.platformId);

    this.logger.log(`流式调用 AI 模型: ${model.name} (${model.modelId})`);

    const stream = await client.chat.completions.create({
      model: model.modelId,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4000,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  // 图片生成（用于生成文章封面或插图）
  async generateImage(
    modelId: string,
    prompt: string,
    options?: { size?: '256x256' | '512x512' | '1024x1024'; n?: number; ratio?: string; resolution?: string },
  ): Promise<string> {
    try {
      const model = await this.prisma.aIModel.findUnique({
        where: { id: modelId },
        include: { platform: true },
      });

      if (!model) throw new Error('AI 图片模型不存在');

      const client = await this.getClient(model.platformId);

      this.logger.log(`调用 AI 图片生成: ${model.name} (${model.modelId}) - Prompt: ${prompt.substring(0, 30)}...`);

      const imageParams: Record<string, unknown> = {
        model: model.modelId,
        prompt,
        n: options?.n ?? 1,
      };

      if (options?.ratio) {
        imageParams.ratio = options.ratio;
        if (options?.resolution) {
          imageParams.resolution = options.resolution;
        }
      } else {
        imageParams.size = options?.size ?? '1024x1024';
      }

      if (options?.resolution && !options?.ratio) {
        imageParams.resolution = options.resolution;
      }

      const response: any = options?.ratio || options?.resolution
        ? await client.post('/images/generations', { body: imageParams as any })
        : await client.images.generate(imageParams as any);

      // 某些中转平台会返回 200，但把错误塞在业务字段里。
      if ((response as any).code && (response as any).code !== 0 && !(response as any).data) {
        throw new Error((response as any).message || '平台接口返回错误');
      }

      const images = response?.data || [];
      if (images.length === 0) {
        throw new Error('图片接口未返回任何图片数据');
      }

      for (const img of images) {
        const url = img.url;
        if (url) {
          try {
            const controller = new AbortController();
            const checkRes = await fetch(url, { method: 'GET', signal: controller.signal });

            if (checkRes.ok) {
              controller.abort();
              const cdnUrl = await this.qiniuService.uploadFromUrl(url);
              return cdnUrl || url;
            }

            this.logger.warn(`图片检测无效 (状态码: ${checkRes.status}): ${url}`);
          } catch (e: unknown) {
            this.logger.warn(`图片检测请求失败: ${url}, Error: ${this.getErrorMessage(e)}`);
          }
        }

        // 兼容返回 base64 的图片平台。
        if (img.b64_json) {
          const buffer = Buffer.from(img.b64_json, 'base64');
          const cdnUrl = await this.qiniuService.uploadBuffer(buffer, 'png', 'ai-images');
          if (cdnUrl) {
            return cdnUrl;
          }
          throw new Error('图片平台返回了 base64 图片，但七牛云未配置或上传失败');
        }
      }

      const fallbackUrl = images.find((img) => img.url)?.url;
      if (fallbackUrl) {
        this.logger.warn('返回的图片链接未通过可用性检测，回退使用原始 URL');
        return fallbackUrl;
      }

      throw new Error('图片平台返回的数据中既没有可用 URL，也没有 b64_json');
    } catch (error: unknown) {
      const message = this.getErrorMessage(error);
      this.logger.error(`AI 图片生成失败: ${message}`);
      throw new Error(message);
    }
  }
}
