import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/api/prisma/prisma.service";
import { handlePrismaError } from "@/utils/error/handler";
import { Prisma, Source } from "@prisma/client";

@Injectable()
export class SourceRepository {
  private readonly logger = new Logger(SourceRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find Source by ID
   * @param id Source ID
   * @returns Source | null
   */
  async findById(
    id: string,
    client?: Prisma.TransactionClient,
  ): Promise<Source | null> {
    try {
      const prisma = await this.prisma.getClient(client);
      return await prisma.source.findUnique({ where: { id } });
    } catch (error) {
      this.logger.error(`Error fetching source by ID: ${error}`);
      handlePrismaError(error, "Something went wrong.");
    }
  }

  /**
   * Find Source by Unique Fields
   * @param where Prisma.SourceFindUniqueArgs
   * @returns Source | null
   */
  async findUnique(
    where: Prisma.SourceWhereUniqueInput,
    client?: Prisma.TransactionClient,
  ): Promise<Source | null> {
    try {
      const prisma = await this.prisma.getClient(client);
      return await prisma.source.findUnique({ where });
    } catch (error) {
      this.logger.error(`Error fetching source: ${error}`);
      handlePrismaError(error, "Something went wrong.");
    }
  }

  /**
   * Find many Sources based on query
   * @param query SourceGetQueryDTO
   * @returns { total: number, data: Source[] }
   */
  // async findMany(
  //     query: SourceGetQueryDTO,
  //     client?: Prisma.TransactionClient
  // ): Promise<{ total: number; data: Source[] }> {
  //     try {
  //         const prisma = await this.prisma.getClient(client);

  //         const where: Prisma.SourceWhereInput = {};
  //         if (query.q) {
  //             where.name = { contains: query.q, mode: "insensitive" };
  //             where.description = { contains: query.q, mode: "insensitive" };
  //         }
  //         if (query.dateFrom || query.dateTo) {
  //             where.createdAt = {};
  //             if (query.dateFrom) where.createdAt.gte = query.dateFrom;
  //             if (query.dateTo) where.createdAt.lte = query.dateTo;
  //         }

  //         const skip = (query.page - 1) * (query.limit ?? 10);
  //         const take = query.limit ?? 10;

  //         const [total, data] = await Promise.all([
  //             prisma.source.count({ where }),
  //             prisma.source.findMany({
  //                 where,
  //                 skip,
  //                 take,
  //                 orderBy: { createdAt: query.order ?? "desc" },
  //             }),
  //         ]);

  //         return { total, data };
  //     } catch (error) {
  //         this.logger.error(`Error fetching sources: ${error}`);
  //         handlePrismaError(error, "Failed to fetch sources.");
  //     }
  // }

  /**
   * Create a new Source
   * @param data Source creation data
   * @returns Created Source
   */
  async create(
    data: Prisma.SourceUncheckedCreateInput,
    client?: Prisma.TransactionClient,
  ): Promise<Source> {
    try {
      const prisma = await this.prisma.getClient(client);
      return await prisma.source.create({ data });
    } catch (error) {
      this.logger.error(`Error creating source: ${error}`);
      handlePrismaError(error, "Failed to create source.");
    }
  }

  /**
   * Update a Source by ID
   * @param id Source ID
   * @param data Source update data
   * @returns Updated Source
   */
  async update(
    id: string,
    data: Prisma.SourceUpdateInput,
    client?: Prisma.TransactionClient,
  ): Promise<Source | null> {
    try {
      const prisma = await this.prisma.getClient(client);
      return await prisma.source.update({ where: { id }, data });
    } catch (error) {
      this.logger.error(`Error updating source: ${error}`);
      handlePrismaError(error, "Failed to update source.");
    }
  }

  /**
   * Soft delete a Source by ID
   * @param id Source ID
   * @param userId User performing the deletion
   * @returns Soft deleted Source
   */
  async softDelete(
    id: string,
    userId: string,
    client?: Prisma.TransactionClient,
  ): Promise<Source | null> {
    try {
      const prisma = await this.prisma.getClient(client);
      return await prisma.source.update({
        where: { id },
        data: { deletedAt: new Date(), deletedBy: userId },
      });
    } catch (error) {
      this.logger.error(`Error soft deleting source: ${error}`);
      handlePrismaError(error, "Failed to soft delete source.");
    }
  }
}
