import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { IAiStrategy } from './ai-strategy.interface';
import { AiActionResult } from './ai-action-result.interface';
import { SCENARIO_CONFIGS } from './scenario-config';

@Injectable()
export class GroqProviderService implements IAiStrategy {
  private readonly logger = new Logger(GroqProviderService.name);
  private groqClient: Groq | null = null;
  private readonly selectedModel: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    this.selectedModel = this.configService.get<string>('GROQ_MODEL', 'openai/gpt-oss-120b');

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

    const config = SCENARIO_CONFIGS[theme] || SCENARIO_CONFIGS['cyberpunk_escape'];

    const langInstruction = lang === 'en'
      ? 'Language: ENGLISH. All narrative text, item names, and suggested_actions MUST be in ENGLISH.'
      : 'Dil: TÜRKÇE. Tüm anlatım (narrative), eşya isimleri ve suggested_actions Türkçe olmalıdır.';

    const scenarioInstructions = lang === 'en' ? config.promptInstructionsEn : config.promptInstructionsTr;

    const systemPrompt = `You are an AI Escape Room Engine executing a dynamic State Machine.
${langInstruction}

${scenarioInstructions}

Current State (JSONB): ${JSON.stringify(currentState)}
Recent Actions History: ${JSON.stringify(history.slice(-3))}

Evaluate Operator Instruction: "${playerAction}". Mutate the state logically.
Strict Rules:
1. Respond ONLY with valid JSON. Do NOT include markdown codeblocks or extra prose.
2. Health delta can be negative, zero, or positive integer.
3. Provide 2-3 logical suggested actions for the operator in ${lang === 'en' ? 'ENGLISH' : 'TURKISH'}.

JSON Response Schema:
{
  "narrative": "Urgent SMS message from Alex describing the action result in first-person...",
  "inventory_added": ["item_name"],
  "inventory_removed": [],
  "environment_updates": { "object": "state" },
  "health_delta": 0,
  "is_completed": false,
  "is_failed": false,
  "suggested_actions": ["Action 1", "Action 2"],
  "sound_effect": "drawer_open"
}`;

    try {
      const completion = await this.groqClient.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Operator Instruction: ${playerAction}` },
        ],
        model: this.selectedModel,
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1000,
      });

      const responseText = completion.choices[0]?.message?.content || '{}';
      return JSON.parse(responseText) as AiActionResult;
    } catch (err) {
      this.logger.warn(`Groq model [${this.selectedModel}] failed: ${err.message}. Retrying with active model openai/gpt-oss-120b...`);
      
      const fallbackCompletion = await this.groqClient.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Operator Instruction: ${playerAction}` },
        ],
        model: 'openai/gpt-oss-120b',
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1000,
      });

      const responseText = fallbackCompletion.choices[0]?.message?.content || '{}';
      return JSON.parse(responseText) as AiActionResult;
    }
  }
}
