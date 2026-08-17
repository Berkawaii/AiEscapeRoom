import { Module, Global } from '@nestjs/common';
import { GroqProviderService } from './groq-provider.service';
import { GeminiProviderService } from './gemini-provider.service';
import { AiEngineService } from './ai-engine.service';

@Global()
@Module({
  providers: [
    GroqProviderService,
    GeminiProviderService,
    AiEngineService,
  ],
  exports: [AiEngineService],
})
export class AiModule {}
