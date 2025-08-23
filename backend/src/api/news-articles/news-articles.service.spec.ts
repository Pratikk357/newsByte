import { Test, TestingModule } from "@nestjs/testing";
import { NewsArticlesService } from "@/api/news-articles/news-articles.service";

describe("NewsArticlesService", () => {
  let service: NewsArticlesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NewsArticlesService],
    }).compile();

    service = module.get<NewsArticlesService>(NewsArticlesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
