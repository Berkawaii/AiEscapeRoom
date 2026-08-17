import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { LocksModule } from './core/locks/locks.module';
import { AiModule } from './core/ai/ai.module';
import { DatabaseModule } from './core/database/database.module';
import { GameModule } from './modules/game/game.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      exclude: ['/api/(.*)'],
    }),
    LocksModule,
    AiModule,
    DatabaseModule,
    GameModule,
  ],
})
export class AppModule {}
