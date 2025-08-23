import { CategoriesRepository } from "@/api/categories/categories.repository";
import { CategoriesService } from "@/api/categories/categories.service";
import {
  CategoryCreateDTO,
  CategoryDeleteDTO,
  CategoryGetQueryDTO,
  CategoryResponseDTO,
} from "@/api/categories/dto";
import { BooleanResponseDTO, ResponseDTO } from "@/common/dto";
import { ConflictException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

const mockCategoriesRepository = {
  create: jest.fn(),
  findAndCount: jest.fn(),
  findById: jest.fn(),
  softDelete: jest.fn(),
};

describe("CategoriesService", () => {
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: CategoriesRepository,
          useValue: mockCategoriesRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createCategory", () => {
    it("should create and return a category successfully", async () => {
      const dto: CategoryCreateDTO = { name: "Test" };
      const fakeEntity = { id: 1, name: "Test" };
      const expected = ResponseDTO.success(
        "Category created successfully.",
        CategoryResponseDTO.fromEntity(fakeEntity),
      );

      mockCategoriesRepository.create.mockResolvedValue(fakeEntity);

      const result = await service.createCategory(dto);
      expect(result).toEqual(expected);
      expect(mockCategoriesRepository.create).toHaveBeenCalledWith({
        name: dto.name,
      });
    });

    it("should throw ConflictException if creation fails", async () => {
      const dto: CategoryCreateDTO = { name: "FailTest" };
      mockCategoriesRepository.create.mockResolvedValue(null);

      await expect(service.createCategory(dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("getAllCategory", () => {
    it("should return empty paginated response if no categories found", async () => {
      const dto: CategoryGetQueryDTO = { page: 1, limit: 10 };
      mockCategoriesRepository.findAndCount.mockResolvedValue({
        total: 0,
        categories: [],
      });

      const result = await service.getAllCategory(dto);

      expect(result.responseObject?.total).toBe(0);
      expect(result.responseObject?.data.length).toBe(0);
      expect(mockCategoriesRepository.findAndCount).toHaveBeenCalledWith(dto);
    });

    it("should return paginated categories", async () => {
      const dto: CategoryGetQueryDTO = { page: 1, limit: 10 };
      const categories = [{ id: 1, name: "Cat1" }];
      mockCategoriesRepository.findAndCount.mockResolvedValue({
        total: 1,
        categories,
      });

      const result = await service.getAllCategory(dto);

      expect(result.responseObject?.total).toBe(1);
      expect(result.responseObject?.data[0].name).toBe("Cat1");
    });
  });

  describe("deleteCategory", () => {
    it("should delete a category and return success", async () => {
      const userId = "123";
      const dto: CategoryDeleteDTO = { id: 1 };

      mockCategoriesRepository.findById.mockResolvedValue({ id: 1 });
      mockCategoriesRepository.softDelete.mockResolvedValue(true);

      const result = await service.deleteCategory(userId, dto);

      expect(result).toEqual(
        ResponseDTO.success(
          "Category deleted successfully.",
          new BooleanResponseDTO(true, "Category deleted successfully."),
        ),
      );
    });

    it("should throw if category not found", async () => {
      const dto: CategoryDeleteDTO = { id: 999 };
      mockCategoriesRepository.findById.mockResolvedValue(null);

      await expect(service.deleteCategory("userId", dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it("should throw if soft delete fails", async () => {
      const dto: CategoryDeleteDTO = { id: 1 };

      mockCategoriesRepository.findById.mockResolvedValue({ id: 1 });
      mockCategoriesRepository.softDelete.mockResolvedValue(null);

      await expect(service.deleteCategory("userId", dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
