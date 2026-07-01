import { Test, TestingModule } from '@nestjs/testing';
import { PublishingController } from './publishing.controller';
import { PublishingService } from './publishing.service';

jest.mock('./publishing.service', () => ({
  PublishingService: class PublishingService {},
}));

describe('PublishingController', () => {
  let controller: PublishingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublishingController],
      providers: [
        {
          provide: PublishingService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<PublishingController>(PublishingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
