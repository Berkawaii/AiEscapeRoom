export interface AiActionResult {
  narrative: string;
  inventory_added?: string[];
  inventory_removed?: string[];
  environment_updates?: Record<string, any>;
  health_delta?: number;
  is_completed?: boolean;
  is_failed?: boolean;
  suggested_actions?: string[];
  sound_effect?: string;
}
