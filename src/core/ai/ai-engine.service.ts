import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAiStrategy } from './ai-strategy.interface';
import { GroqProviderService } from './groq-provider.service';
import { GeminiProviderService } from './gemini-provider.service';
import { AiActionResult } from './ai-action-result.interface';

@Injectable()
export class AiEngineService {
  private readonly logger = new Logger(AiEngineService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly groqProvider: GroqProviderService,
    private readonly geminiProvider: GeminiProviderService,
  ) {}

  async processAction(
    theme: string,
    currentState: any,
    playerAction: string,
    history: any[],
    lang: 'tr' | 'en' = 'tr',
    preferredProvider?: 'groq' | 'gemini' | 'auto',
  ): Promise<{ result: AiActionResult; providerUsed: string }> {
    let orderedProviders: IAiStrategy[] = [];

    if (preferredProvider === 'gemini') {
      orderedProviders = [this.geminiProvider, this.groqProvider];
    } else if (preferredProvider === 'groq') {
      orderedProviders = [this.groqProvider, this.geminiProvider];
    } else {
      const primary = this.configService.get<string>('PRIMARY_AI_PROVIDER', 'groq').toLowerCase();
      orderedProviders = primary === 'gemini' 
        ? [this.geminiProvider, this.groqProvider] 
        : [this.groqProvider, this.geminiProvider];
    }

    const availableProviders = orderedProviders.filter((p) => p.isAvailable());

    if (availableProviders.length === 0) {
      throw new ServiceUnavailableException(
        'Hiçbir AI motoru (Groq / Gemini) yapılandırılmadı! Lütfen .env dosyanıza GROQ_API_KEY veya GEMINI_API_KEY ekleyin.',
      );
    }

    for (const provider of availableProviders) {
      try {
        this.logger.log(`Executing AI action (${lang.toUpperCase()}) using [${provider.providerName}]...`);
        const result = await provider.executeAction(theme, currentState, playerAction, history, lang);

        const lowerAction = playerAction.toLowerCase();
        const explicitVisualRequests = [
          'show me', 'take a photo', 'take photo', 'send photo', 'send picture',
          'show photo', 'show picture', 'snap photo', 'camera', 'photo', 'picture',
          'resim gönder', 'foto gönder', 'fotoğraf gönder', 'görsel gönder',
          'resmini gönder', 'fotoyu gönder', 'resim çek', 'foto çek', 'fotoğraf çek',
          'göster bana', 'bana göster', 'resmini göster', 'fotoğrafını göster', 'görselini göster',
          'fotoğraf at', 'foto at', 'resim at', 'görsel at'
        ];

        const isVisualRequested = explicitVisualRequests.some((kw) => lowerAction.includes(kw));

        if (isVisualRequested) {
          let photoKeywords = 'first person POV detailed room inspection environment snapshot';

          if (lowerAction.includes('panel') || lowerAction.includes('sembol') || lowerAction.includes('port')) {
            photoKeywords = 'maintenance panel glowing symbols ports interface';
          } else if (lowerAction.includes('robot') || lowerAction.includes('koridor') || lowerAction.includes('corridor')) {
            photoKeywords = 'patrolling security robot corridor laser sensors';
          } else if (lowerAction.includes('şifre') || lowerAction.includes('kod') || lowerAction.includes('code')) {
            photoKeywords = 'holographic terminal screen displaying encryption code';
          } else if (lowerAction.includes('piyano') || lowerAction.includes('saat') || lowerAction.includes('clock') || lowerAction.includes('piano')) {
            photoKeywords = '1920s antique piano wall clock drawn in blood gothic cellar';
          } else if (lowerAction.includes('formül') || lowerAction.includes('asit') || lowerAction.includes('formula')) {
            photoKeywords = 'burnt chemical formula paper on lab desk acid smoke';
          } else if (lowerAction.includes('kemik') || lowerAction.includes('pranga') || lowerAction.includes('bone') || lowerAction.includes('shackle')) {
            photoKeywords = 'mossy dungeon cell iron shackles broken bone fragment';
          }

          const basePrompts: Record<string, string> = {
            cyberpunk_escape: `cyberpunk 2142 Arasaka server room ${photoKeywords} neon blue lighting high tech cinematic 8k`,
            haunted_mansion: `1920s gothic horror Blackwood manor cellar ${photoKeywords} eerie candle fog cinematic 8k`,
            scifi_spaceship: `LV426 spaceship medical lab ${photoKeywords} red emergency lights horror atmosphere 8k`,
            medieval_dungeon: `medieval castle dungeon cell ${photoKeywords} damp stone torches fantasy cinematic 8k`
          };

          const promptText = encodeURIComponent(basePrompts[theme] || basePrompts['cyberpunk_escape']);
          const randomSeed = Math.floor(Math.random() * 999999);
          result.image_url = `https://image.pollinations.ai/prompt/${promptText}?width=600&height=380&nologo=true&seed=${randomSeed}`;

          this.logger.log(`📷 Generated Field Snapshot URL: ${result.image_url}`);
        } else {
          result.image_url = null;
        }

        return { result, providerUsed: provider.providerName };
      } catch (error) {
        this.logger.error(`AI Provider [${provider.providerName}] error: ${error.stack || error.message}. Trying next provider...`);
      }
    }

    throw new ServiceUnavailableException(
      'Yapılandırılmış tüm AI motorları (Groq / Gemini) şu anda yanıt veremiyor veya oran sınırına (rate limit) ulaştı.',
    );
  }
}
