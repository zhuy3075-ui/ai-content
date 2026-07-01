import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { PublishingService } from './publishing.service';
import { WechatPublisherService } from './wechat-publisher/wechat-publisher.service';

jest.mock('./wechat-publisher/wechat-publisher.service', () => ({
  WechatPublisherService: class WechatPublisherService {},
}));

describe('PublishingService', () => {
  let service: PublishingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublishingService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: WechatPublisherService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<PublishingService>(PublishingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
