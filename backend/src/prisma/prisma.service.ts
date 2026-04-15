import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    try {
      await this.$executeRawUnsafe('PRAGMA foreign_keys = ON');
    } catch {
      // Ignore if SQLite driver doesn't support or fails
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

