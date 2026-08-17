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
    lang: 'tr' | 'en' = 'tr',
  ): Promise<AiActionResult> {
    if (!this.aiClient) {
      throw new Error('Gemini client is not initialized.');
    }

    const langInstruction = lang === 'en'
      ? 'Language: ENGLISH. All narrative text, item names, and suggested_actions MUST be in ENGLISH.'
      : 'Dil: TÜRKÇE. Tüm anlatım (narrative), eşya isimleri ve suggested_actions Türkçe olmalıdır.';

    const systemPrompt = `You are a Senior Game Master running an AI-driven Escape Room Engine.
${langInstruction}
Room Theme: ${theme}
Current State: ${JSON.stringify(currentState)}
Recent Actions History: ${JSON.stringify(history.slice(-3))}

Evaluate Player Action: "${playerAction}"
Rules:
1. Respond ONLY with valid JSON matching the schema below.

JSON Schema:
{
  "narrative": "Story narrative in ${lang === 'en' ? 'ENGLISH' : 'TURKISH'}...",
  "inventory_added": [],
  "inventory_removed": [],
  "environment_updates": {},
  "health_delta": 0,
  "is_completed": false,
  "is_failed": false,
  "suggested_actions": ["Action 1", "Action 2"],
  "sound_effect": "click"
}`;

    const model = this.aiClient.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const response = await model.generateContent(`${systemPrompt}\n\nPlayer Action: ${playerAction}`);
    const text = response.response.text() || '{}';
    return JSON.parse(text) as AiActionResult;
  }
}
