import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WechatPublisherService } from './wechat-publisher/wechat-publisher.service';

@Injectable()
export class PublishingService {
    private readonly logger = new Logger(PublishingService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly wechatPublisher: WechatPublisherService,
    ) { }

    // ================= 账号管理接口 =================

    async getAccounts() {
        return this.prisma.publishAccount.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async createAccount(data: { platform: string; name: string; appId?: string; apiToken?: string; config?: any }) {
        return this.prisma.publishAccount.create({ data });
    }

    async updateAccount(id: string, data: any) {
        return this.prisma.publishAccount.update({ where: { id }, data });
    }

    async deleteAccount(id: string) {
        return this.prisma.publishAccount.delete({ where: { id } });
    }

    // ================= 发布调度接口 =================

    /**
     * 将文章发往指定账号
     */
    async publishArticle(articleId: string, accountId: string): Promise<any> {
        const article = await this.prisma.article.findUnique({ where: { id: articleId } });
        if (!article) throw new NotFoundException('文章不存在');

        const account = await this.prisma.publishAccount.findUnique({ where: { id: accountId } });
        if (!account) throw new NotFoundException('发布账号不存在');

        // 初始化一条待发布状态的记录
        const record = await this.prisma.publishRecord.create({
            data: {
                articleId: article.id,
                accountId: account.id,
                platform: account.platform,
                status: 'pending',
            },
        });

        try {
            let result;

            // 路由到具体的平台 Service
            if (account.platform === 'wechat') {
                if (!account.apiToken || !account.appId) {
                    throw new BadRequestException('微信发布需要配置 apiToken 和 appId');
                }

                const config = (account.config as Record<string, any>) || {};
                if (!config.apiUrl) {
                    throw new BadRequestException('微信发布需要配置第三方 API 地址');
                }

                result = await this.wechatPublisher.publish({
                    apiToken: account.apiToken,
                    authorizerAppid: account.appId,
                    apiUrl: config.apiUrl,
                    title: article.title,
                    markdownContent: article.contentFormat === 'markdown' ? article.content : undefined,
                    htmlContent: article.finalHtml || (article.contentFormat === 'html' ? article.content : undefined),
                    coverUrl: article.coverImage || undefined,
                    categoryId: config.categoryId,
                    needOpenComment: config.openComment !== undefined ? Number(config.openComment) : 1,
                    onlyFansCanComment: config.onlyFansCanComment !== undefined ? Number(config.onlyFansCanComment) : 0,
                });
            } else {
                throw new BadRequestException('暂时只支持 wechat 平台的发布');
            }

            // 更新记录为成功
            await this.prisma.$transaction([
                this.prisma.publishRecord.update({
                    where: { id: record.id },
                    data: {
                        status: 'success',
                        publishUrl: result.publishUrl || result.articleId, // 暂存 ID 或链接
                    },
                }),
                this.prisma.article.update({
                    where: { id: article.id },
                    data: { status: 'published' },
                }),
            ]);

            return { success: true, articleId: result.articleId };

        } catch (error) {
            this.logger.error(`发布失败 [articleId: ${articleId}, accountId: ${accountId}]: ${error.message}`);

            // 更新记录为失败
            await this.prisma.publishRecord.update({
                where: { id: record.id },
                data: {
                    status: 'failed',
                    errorMessage: error.message,
                },
            });

            throw new BadRequestException(`发布失败: ${error.message}`);
        }
    }

    /**
     * 获取某篇文章的发布记录
     */
    async getRecordsByArticle(articleId: string) {
        return this.prisma.publishRecord.findMany({
            where: { articleId },
            include: { account: true },
            orderBy: { createdAt: 'desc' },
        });
    }
}
