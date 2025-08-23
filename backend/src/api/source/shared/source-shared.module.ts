import { Module } from "@nestjs/common";
import { SourceRepository } from "@/api/source/source.repository";
import { PrismaModule } from "@/api/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [SourceRepository],
  exports: [SourceRepository],
})
export class SourceSharedModule {}
