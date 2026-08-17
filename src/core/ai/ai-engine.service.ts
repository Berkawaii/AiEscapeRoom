import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAiStrategy } from './ai-strategy.interface';
import { GroqProviderService } from './groq-provider.service';
import { GeminiProviderService } from './gemini-provider.service';
import { AiActionResult } from './ai-action-result.interface';

@Injectable()
export class AiEngineService {
  private readonly logger = new Logger(AiEngineService.name);
  private providers: IAiStrategy[] = [];

  constructor(
    private readonly configService: ConfigService,
    private readonly groqProvider: GroqProviderService,
    private readonly geminiProvider: GeminiProviderService,
  ) {
    const primary = this.configService.get<string>('PRIMARY_AI_PROVIDER', 'groq').toLowerCase();

    if (primary === 'gemini') {
      this.providers = [this.geminiProvider, this.groqProvider];
    } else {
      this.providers = [this.groqProvider, this.geminiProvider];
    }
  }

  async processAction(
    theme: string,
    currentState: any,
    playerAction: string,
    history: any[],
  ): Promise<{ result: AiActionResult; providerUsed: string }> {
    const availableProviders = this.providers.filter((p) => p.isAvailable());

    if (availableProviders.length === 0) {
      throw new ServiceUnavailableException(
        'Hiçbir AI motoru (Groq / Gemini) yapılandırılmadı! Lütfen .env dosyanıza GROQ_API_KEY veya GEMINI_API_KEY ekleyin.',
      );
    }

    for (const provider of availableProviders) {
      try {
        this.logger.log(`Executing AI action using [${provider.providerName}]...`);
        const result = await provider.executeAction(theme, currentState, playerAction, history);
        return { result, providerUsed: provider.providerName };
      } catch (error) {
        this.logger.warn(`Provider [${provider.providerName}] failed: ${error.message}. Trying next available provider...`);
      }
    }

    throw new ServiceUnavailableException(
      'Yapılandırılmış tüm AI motorları (Groq / Gemini) şu anda yanıt veremiyor veya oran sınırına (rate limit) ulaştı.',
    );
  }
}
