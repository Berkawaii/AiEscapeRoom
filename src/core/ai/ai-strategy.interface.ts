import { AiActionResult } from './ai-action-result.interface';

export interface IAiStrategy {
  readonly providerName: string;
  isAvailable(): boolean;
  executeAction(
    theme: string,
    currentState: any,
    playerAction: string,
    history: any[],
  ): Promise<AiActionResult>;
}
