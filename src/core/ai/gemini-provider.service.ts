import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAiStrategy } from './ai-strategy.interface';
import { AiActionResult } from './ai-action-result.interface';
import { SCENARIO_CONFIGS } from './scenario-config';

@Injectable()
export class GeminiProviderService implements IAiStrategy {
  private readonly logger = new Logger(GeminiProviderService.name);
  private aiClient: GoogleGenerativeAI | null = null;
  private readonly selectedModel: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.selectedModel = this.configService.get<string>('GEMINI_MODEL', 'gemini-3.5-flash');

    if (apiKey && apiKey !== 'your-gemini-api-key') {
      this.aiClient = new GoogleGenerativeAI(apiKey);
      this.logger.log(`Google Gemini Provider initialized [Model: ${this.selectedModel}].`);
    } else {
      this.logger.warn('Gemini API Key not found. Gemini provider will be disabled.');
    }
  }

  get providerName(): string {
    return `Google Gemini (${this.selectedModel})`;
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

    const config = SCENARIO_CONFIGS[theme] || SCENARIO_CONFIGS['cyberpunk_escape'];

    const langInstruction = lang === 'en'
      ? 'Language: ENGLISH. All narrative text, item names, and suggested_actions MUST be in ENGLISH.'
      : 'Dil: TÜRKÇE. Tüm anlatım (narrative), eşya isimleri ve suggested_actions Türkçe olmalıdır.';

    const scenarioInstructions = lang === 'en' ? config.promptInstructionsEn : config.promptInstructionsTr;

    const systemPrompt = `You are an AI Escape Room Engine executing a dynamic State Machine.
${langInstruction}

${scenarioInstructions}

Current State: ${JSON.stringify(currentState)}
Recent Actions History: ${JSON.stringify(history.slice(-3))}

Evaluate Operator Instruction: "${playerAction}"
Rules:
1. Respond ONLY with valid JSON matching the schema below.

JSON Schema:
{
  "narrative": "Urgent SMS message from Alex describing the action result in first-person...",
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
      model: this.selectedModel,
      generationConfig: { responseMimeType: 'application/json' },
    });

    const response = await model.generateContent(`${systemPrompt}\n\nOperator Instruction: ${playerAction}`);
    const text = response.response.text() || '{}';
    return JSON.parse(text) as AiActionResult;
  }
}
