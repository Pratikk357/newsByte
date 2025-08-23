import { CategoriesRepository } from "@/api/categories/categories.repository";
import {
  CategoryCreateDTO,
  CategoryDeleteDTO,
  CategoryGetQueryDTO,
  CategoryResponseDTO,
  PaginatedCategoryListDTO,
} from "@/api/categories/dto";
import { BooleanResponseDTO, ResponseDTO } from "@/common/dto";
import { handleError } from "@/utils/error/handler";
import { ConflictException, Injectable, Logger } from "@nestjs/common";

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  /**
   * Create a new category
   * @param categoryDTO Category DTO
   * @returns Created category
   */
  async createCategory(
    categoryDTO: CategoryCreateDTO,
  ): Promise<ResponseDTO<CategoryResponseDTO>> {
    try {
      const category = await this.categoriesRepository.create({
        name: categoryDTO.name,
      });
      if (!category)
        throw new ConflictException("Error during category creation.");

      const categoryResponseDTO = CategoryResponseDTO.fromEntity(category);
      return ResponseDTO.success(
        "Category created successfully.",
        categoryResponseDTO,
      );
    } catch (error) {
      handleError(error, "Error creating category.", this.logger);
    }
  }

  /**
   * Get all categories with pagination and filtering
   * @param getCategoryDTO Get Category DTO
   * @returns List of categories
   */
  async getAllCategory(
    getCategoryDTO: CategoryGetQueryDTO,
  ): Promise<ResponseDTO<PaginatedCategoryListDTO>> {
    try {
      const categoryListObj =
        await this.categoriesRepository.findAndCount(getCategoryDTO);
      if (!categoryListObj)
        throw new ConflictException("Error fetching categories.");
      const paginatedCategoryListDTO = PaginatedCategoryListDTO.fromEntity(
        getCategoryDTO.page,
        getCategoryDTO.limit,
        categoryListObj.total,
        categoryListObj.categories,
      );
      if (categoryListObj.total === 0) {
        return ResponseDTO.success(
          "No categories found.",
          paginatedCategoryListDTO,
        );
      }

      return ResponseDTO.success(
        "Categories fetched successfully.",
        paginatedCategoryListDTO,
      );
    } catch (error) {
      handleError(error, "Error fetching categories.", this.logger);
    }
  }

  /**
   * Delete a category
   * @param deleteCategoryDTO Delete Category DTO
   * @returns Deleted category
   */
  async deleteCategory(
    userId: string,
    deleteCategoryDTO: CategoryDeleteDTO,
  ): Promise<ResponseDTO<BooleanResponseDTO>> {
    try {
      const categoryExists = await this.categoriesRepository.findById(
        deleteCategoryDTO.id,
      );
      if (!categoryExists) throw new ConflictException("Category not found.");

      const category = await this.categoriesRepository.softDelete(
        deleteCategoryDTO.id,
        userId,
      );
      if (!category)
        throw new ConflictException("Error during category deletion.");

      return ResponseDTO.success(
        "Category deleted successfully.",
        new BooleanResponseDTO(true, "Category deleted successfully."),
      );
    } catch (error) {
      handleError(error, "Error deleting category.", this.logger);
    }
  }
}
