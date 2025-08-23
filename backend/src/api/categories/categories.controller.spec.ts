import { CategoriesController } from "@/api/categories/categories.controller";
import { CategoriesRepository } from "@/api/categories/categories.repository";
import { CategoriesService } from "@/api/categories/categories.service";
import {
  CategoryCreateDTO,
  CategoryDeleteDTO,
  CategoryGetQueryDTO,
  CategoryResponseDTO,
  PaginatedCategoryListDTO,
} from "@/api/categories/dto";
import { BooleanResponseDTO, ResponseDTO } from "@/common/dto";
import { Test, TestingModule } from "@nestjs/testing";

// Mock the CategoriesService
const mockCategoriesService = {
  createCategory: jest.fn(),
  getAllCategory: jest.fn(),
  deleteCategory: jest.fn(),
};

// Mock the CategoriesRepository
const mockCategoriesRepository = {
  findById: jest.fn(),
  create: jest.fn(),
  findAndCount: jest.fn(),
  softDelete: jest.fn(),
};

describe("CategoriesController", () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        { provide: CategoriesService, useValue: mockCategoriesService },
        { provide: CategoriesRepository, useValue: mockCategoriesRepository },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("createCategory", () => {
    it("should create a category successfully", async () => {
      const categoryDTO: CategoryCreateDTO = { name: "Test Category" };
      const mockResponse: ResponseDTO<CategoryResponseDTO> =
        ResponseDTO.success("Category created successfully.", {
          id: 1,
          name: "Test Category",
        });
      mockCategoriesService.createCategory.mockResolvedValue(mockResponse);

      const response = await controller.createCategory(categoryDTO);

      expect(response).toEqual(mockResponse);
      expect(mockCategoriesService.createCategory).toHaveBeenCalledWith(
        categoryDTO,
      );
      expect(mockCategoriesService.createCategory).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllCategory", () => {
    it("should return a list of categories", async () => {
      const queryDTO: CategoryGetQueryDTO = { page: 1, limit: 10 };
      const mockResponse: ResponseDTO<PaginatedCategoryListDTO> =
        ResponseDTO.success("Categories fetched successfully.", {
          page: 1,
          limit: 10,
          total: 2,
          data: [
            { id: 1, name: "Category 1" },
            { id: 2, name: "Category 2" },
          ],
        });
      mockCategoriesService.getAllCategory.mockResolvedValue(mockResponse);

      const response = await controller.getAllCategory(queryDTO);

      expect(response).toEqual(mockResponse);
      expect(mockCategoriesService.getAllCategory).toHaveBeenCalledWith(
        queryDTO,
      );
      expect(mockCategoriesService.getAllCategory).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteCategory", () => {
    it("should delete a category successfully", async () => {
      const deleteDTO: CategoryDeleteDTO = { id: 1 };
      const userId = 1;
      const result: ResponseDTO<BooleanResponseDTO> = ResponseDTO.success(
        "Category deleted successfully.",
        new BooleanResponseDTO(true, "Category deleted successfully."),
      );

      const request: any = { user: { userId } };

      mockCategoriesService.deleteCategory.mockResolvedValue(result);

      const response = await controller.deleteCategory(request, deleteDTO);

      expect(response).toEqual(result);
      expect(mockCategoriesService.deleteCategory).toHaveBeenCalledWith(
        userId,
        deleteDTO,
      );
      expect(mockCategoriesService.deleteCategory).toHaveBeenCalledTimes(1);
    });
  });
});
