import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAiStrategy } from './ai-strategy.interface';
import { AiActionResult } from './ai-action-result.interface';

@Injectable()
export class GeminiProviderService implements IAiStrategy {
  readonly providerName = 'Google Gemini 2.0 Flash';
  private readonly logger = new Logger(GeminiProviderService.name);
  private aiClient: GoogleGenerativeAI | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey && apiKey !== 'your-gemini-api-key') {
      this.aiClient = new GoogleGenerativeAI(apiKey);
      this.logger.log('Google Gemini 2.0 Flash Provider initialized.');
    } else {
      this.logger.warn('Gemini API Key not found. Gemini provider will be disabled.');
    }
  }

  isAvailable(): boolean {
    return !!this.aiClient;
  }

  async executeAction(
    theme: string,
    currentState: any,
    playerAction: string,
    history: any[],
  ): Promise<AiActionResult> {
    if (!this.aiClient) {
      throw new Error('Gemini client is not initialized.');
    }

    const systemPrompt = `Sen kurumsal seviyede bir Kaçış Odası ve Dedektiflik Oyunu Motorusunun Yöneticisisin (Game Master).
Oda Teması: ${theme}
Mevcut Oda Durumu: ${JSON.stringify(currentState)}
Son Aksiyonlar: ${JSON.stringify(history.slice(-3))}

Kullanıcı Hamlesi: "${playerAction}"
Görevin: Bu hamleyi değerlendir ve o anki dünya durumunu güncelle.
Zorunlu Kurallar:
1. Yanıtı SADECE geçerli bir JSON objesi olarak döndür.
2. Narrative Türkçe olmalı, atmosferik ve sürükleyici olmalı.

Yanıt Formatı:
{
  "narrative": "Sonuç anlatımı...",
  "inventory_added": [],
  "inventory_removed": [],
  "environment_updates": {},
  "health_delta": 0,
  "is_completed": false,
  "is_failed": false,
  "suggested_actions": ["Aksiyon 1", "Aksiyon 2"],
  "sound_effect": "click"
}`;

    const model = this.aiClient.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const response = await model.generateContent(`${systemPrompt}\n\nOyuncu Aksiyonu: ${playerAction}`);
    const text = response.response.text() || '{}';
    return JSON.parse(text) as AiActionResult;
  }
}
