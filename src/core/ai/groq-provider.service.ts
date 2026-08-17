import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { IAiStrategy } from './ai-strategy.interface';
import { AiActionResult } from './ai-action-result.interface';

@Injectable()
export class GroqProviderService implements IAiStrategy {
  private readonly logger = new Logger(GroqProviderService.name);
  private groqClient: Groq | null = null;
  private readonly selectedModel: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    this.selectedModel = this.configService.get<string>('GROQ_MODEL', 'llama-3.3-70b-versatile');

    if (apiKey && apiKey !== 'your-groq-api-key') {
      this.groqClient = new Groq({ apiKey });
      this.logger.log(`Groq Sub-Second LLM Provider initialized [Model: ${this.selectedModel}].`);
    } else {
      this.logger.warn('Groq API Key not found. Groq provider will be disabled.');
    }
  }

  get providerName(): string {
    return `Groq (${this.selectedModel})`;
  }

  isAvailable(): boolean {
    return !!this.groqClient;
  }

  async executeAction(
    theme: string,
    currentState: any,
    playerAction: string,
    history: any[],
    lang: 'tr' | 'en' = 'tr',
  ): Promise<AiActionResult> {
    if (!this.groqClient) {
      throw new Error('Groq client is not initialized.');
    }

    const langInstruction = lang === 'en'
      ? 'Language: ENGLISH. All narrative text, item names, and suggested_actions MUST be in ENGLISH.'
      : 'Dil: TÜRKÇE. Tüm anlatım (narrative), eşya isimleri ve suggested_actions Türkçe olmalıdır.';

    const systemPrompt = `You are a Senior Game Master running an AI-driven Escape Room Engine (State Machine).
${langInstruction}
Room Theme: ${theme}
Current State (JSONB): ${JSON.stringify(currentState)}
Recent Actions History: ${JSON.stringify(history.slice(-3))}

Evaluate the player's action: "${playerAction}". Mutate the state logically.
Strict Rules:
1. Respond ONLY with valid JSON. Do NOT include markdown codeblocks or extra prose.
2. Health delta can be negative, zero, or positive integer.
3. Provide 2-3 logical suggested actions for the player in ${lang === 'en' ? 'ENGLISH' : 'TURKISH'}.

JSON Response Schema:
{
  "narrative": "Atmospheric description of the action result...",
  "inventory_added": ["item_name"],
  "inventory_removed": [],
  "environment_updates": { "object": "state" },
  "health_delta": 0,
  "is_completed": false,
  "is_failed": false,
  "suggested_actions": ["Action 1", "Action 2"],
  "sound_effect": "drawer_open"
}`;

    const completion = await this.groqClient.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Player Action: ${playerAction}` },
      ],
      model: this.selectedModel,
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    return JSON.parse(responseText) as AiActionResult;
  }
}
