import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { IAiStrategy } from './ai-strategy.interface';
import { AiActionResult } from './ai-action-result.interface';

@Injectable()
export class GroqProviderService implements IAiStrategy {
  readonly providerName = 'Groq (Llama-3.3-70b-versatile)';
  private readonly logger = new Logger(GroqProviderService.name);
  private groqClient: Groq | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (apiKey && apiKey !== 'your-groq-api-key') {
      this.groqClient = new Groq({ apiKey });
      this.logger.log('Groq Sub-Second LLM Provider initialized.');
    } else {
      this.logger.warn('Groq API Key not found. Groq provider will be disabled.');
    }
  }

  isAvailable(): boolean {
    return !!this.groqClient;
  }

  async executeAction(
    theme: string,
    currentState: any,
    playerAction: string,
    history: any[],
  ): Promise<AiActionResult> {
    if (!this.groqClient) {
      throw new Error('Groq client is not initialized.');
    }

    const systemPrompt = `Sen kurumsal seviyede yüksek kaliteli bir Kaçış Odası ve Dedektiflik Oyunu Motorusunun Yöneticisisin (Game Master).
Oda Teması: ${theme}
Mevcut Oda Durumu (JSONB): ${JSON.stringify(currentState)}
Son Geçmiş Aksiyonlar: ${JSON.stringify(history.slice(-3))}

Kullanıcının yaptığı hamleyi ("${playerAction}") değerlendir ve oda durumunu (JSONB) mantıksal bir State Machine gibi güncelle.
Zorunlu Kurallar:
1. SADECE aşağıdaki JSON formatında yanıt ver. Başka hiçbir açıklama yazma.
2. Narrative Türkçe olmalı, atmosferik ve akıcı olmalı.
3. Sağlık (health_delta) negatif veya pozitif tamsayı olabilir (Örn: -10, 0, +5).
4. suggested_actions listesinde oyuncuya 2-3 mantıklı sonraki aksiyon öner.

Yanıt Formatı (JSON):
{
  "narrative": "Aksiyonun atmosferik sonucu...",
  "inventory_added": ["anahtar"],
  "inventory_removed": [],
  "environment_updates": { "door": "unlocked" },
  "health_delta": 0,
  "is_completed": false,
  "is_failed": false,
  "suggested_actions": ["Aksiyon 1", "Aksiyon 2"],
  "sound_effect": "unlock"
}`;

    const completion = await this.groqClient.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Oyuncu Aksiyonu: ${playerAction}` },
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    return JSON.parse(responseText) as AiActionResult;
  }
}
