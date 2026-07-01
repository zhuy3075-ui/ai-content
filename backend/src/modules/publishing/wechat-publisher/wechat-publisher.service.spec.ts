import { Test, TestingModule } from '@nestjs/testing';
import { WechatPublisherService } from './wechat-publisher.service';

jest.mock('./wechat-compiler', () => ({
  WechatCompiler: {
    compile: jest.fn().mockResolvedValue('<p>ok</p>'),
  },
}));

describe('WechatPublisherService', () => {
  let service: WechatPublisherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WechatPublisherService],
    }).compile();

    service = module.get<WechatPublisherService>(WechatPublisherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
