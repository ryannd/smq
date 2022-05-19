import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import next from 'next';
import { NextServer } from 'next/dist/server/next';

@Injectable()
export class ViewService implements OnModuleInit {
  private server: NextServer;
  private logger: Logger = new Logger('ViewService');
  async onModuleInit(): Promise<void> {
    try {
      this.server = next({
        dev: process.env.NODE_ENV !== 'production',
        dir: './src/client',
      });
      await this.server.prepare();
    } catch (error) {
      this.logger.error(error);
    }
  }

  getNextServer(): NextServer {
    return this.server;
  }
}
