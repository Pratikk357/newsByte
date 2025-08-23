import { CategoriesService } from "@/api/categories/categories.service";
import {
  CategoryCreateDTO,
  CategoryResponseDTO,
  CategoryResponseWrapperDTO,
} from "@/api/categories/dto/create.dto";
import { CategoryDeleteDTO } from "@/api/categories/dto/delete.dto";
import {
  CategoryGetQueryDTO,
  PaginatedCategoryListDTO,
  PaginatedCategoryListResponseWrapperDTO,
} from "@/api/categories/dto/list.dto";
import { Public, Roles } from "@/common/decorators";
import { BooleanResponseDTO, ResponseDTO } from "@/common/dto";
import { _FastifyRequest } from "@/common/types";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Role } from "@prisma/client";

@ApiTags("Categories")
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * @param categoryDTO Category DTO.
   * @returns Standard Service Response
   */
  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({ summary: "Create Category" })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "Category created successfully.",
    type: CategoryResponseWrapperDTO,
  })
  async createCategory(
    @Body() categoryDTO: CategoryCreateDTO,
  ): Promise<ResponseDTO<CategoryResponseDTO>> {
    return await this.categoriesService.createCategory(categoryDTO);
  }

  /**
   * @param getCategoryDTO Get Category DTO.
   * @returns Standard Service Response
   */
  @Public()
  @Get()
  @ApiOperation({ summary: "Get Categories List." })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "Category Fetched successfully.",
    type: PaginatedCategoryListResponseWrapperDTO,
  })
  async getAllCategory(
    @Query() getCategoryDTO: CategoryGetQueryDTO,
  ): Promise<ResponseDTO<PaginatedCategoryListDTO>> {
    return await this.categoriesService.getAllCategory(getCategoryDTO);
  }

  /**
   * @param deleteCategoryDTO Delete Category DTO.
   * @returns Standard Service Response
   */
  @Delete(":id")
  @Roles(...[Role.SUPERADMIN, Role.ADMIN])
  @ApiOperation({ summary: "Delete Category" })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "Category deleted successfully.",
    type: CategoryResponseWrapperDTO,
  })
  async deleteCategory(
    @Req() request: _FastifyRequest,
    @Param() deleteCategoryDTO: CategoryDeleteDTO,
  ): Promise<ResponseDTO<BooleanResponseDTO>> {
    const userId = request.user.userId;
    return await this.categoriesService.deleteCategory(
      userId,
      deleteCategoryDTO,
    );
  }
}
