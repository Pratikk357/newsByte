import { NewsArticlesController } from "@/api/news-articles/news-articles.controller";
import { Test, TestingModule } from "@nestjs/testing";

describe("NewsArticlesController", () => {
  let controller: NewsArticlesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsArticlesController],
    }).compile();

    controller = module.get<NewsArticlesController>(NewsArticlesController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
