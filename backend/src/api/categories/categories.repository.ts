import { CategoryGetQueryDTO } from "@/api/categories/dto";
import { PrismaService } from "@/api/prisma/prisma.service";
import { handlePrismaError } from "@/utils/error/handler";
import { Injectable, Logger } from "@nestjs/common";
import { Category } from "@prisma/client";
import { Prisma } from "@prisma/client";

@Injectable()
export class CategoriesRepository {
  private readonly logger = new Logger(CategoriesRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find By ID
   * @param id Category ID
   * @returns Category
   */
  async findById(id: string): Promise<Category | null> {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id },
      });
      return category ? category : null;
    } catch (error) {
      this.logger.error(`Error fetching category by ID: ${error}`);
      handlePrismaError(error, "Something went wrong.");
    }
  }

  /**
   * Create a new category
   * @param data Category data
   * @returns Created category
   */
  async create(data: Prisma.CategoryCreateInput): Promise<Category | null> {
    try {
      const category = await this.prisma.category.create({
        data,
      });
      return category;
    } catch (error) {
      this.logger.error(`Error creating category: ${error}`);
      handlePrismaError(error, "Something went wrong.");
    }
  }

  /**
   * Find and count categories with pagination and filtering
   * @param getCategoryDTO Get Category DTO
   * @returns List of categories and total count
   */
  async findAndCount(getCategoryDTO: CategoryGetQueryDTO): Promise<{
    total: number;
    categories: Category[];
  }> {
    try {
      const { name, page, limit, sortBy = "name", sortOrder } = getCategoryDTO;

      const whereClause = name ? { name: { contains: name } } : {};

      const categories = await this.prisma.category.findMany({
        where: whereClause,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      });
      const total = await this.prisma.category.count({
        where: whereClause,
      });

      return { total, categories };
    } catch (error: unknown) {
      this.logger.error(`Error fetching categories: ${error}`);
      handlePrismaError(error, "Something went wrong.");
    }
  }

  /**
   * Delete a category by ID
   * @param userId User ID
   * @param id Category ID
   * @returns Deleted category
   */
  async softDelete(id: string, userId: string): Promise<Category | null> {
    try {
      const category = await this.prisma.category.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: userId,
        },
      });
      return category ? category : null;
    } catch (error) {
      this.logger.error(`Error deleting category by ID: ${error}`);
      handlePrismaError(error, "Something went wrong.");
    }
  }
}
