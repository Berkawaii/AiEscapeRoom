import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { SupabaseService, RoomRecord } from '../../core/database/supabase.service';
import { AiEngineService } from '../../core/ai/ai-engine.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { PlayerActionDto } from './dto/player-action.dto';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly aiEngineService: AiEngineService,
  ) {}

  async createRoom(dto: CreateRoomDto): Promise<RoomRecord> {
    const theme = dto.theme || 'cyberpunk_escape';
    const title = dto.title || `${theme.replace('_', ' ').toUpperCase()} ESCAPE ROOM`;
    return this.supabaseService.createRoom(theme, title);
  }

  async getRoom(roomId: string): Promise<RoomRecord> {
    const room = await this.supabaseService.getRoomById(roomId);
    if (!room) {
      throw new NotFoundException(`Oda bulunamadı (ID: ${roomId})`);
    }
    return room;
  }

  async processAction(roomId: string, dto: PlayerActionDto) {
    const room = await this.getRoom(roomId);

    if (room.status === 'completed') {
      throw new BadRequestException('Bu kaçış odasını zaten başarıyla tamamladınız!');
    }
    if (room.status === 'failed') {
      throw new BadRequestException('Bu kaçış odasında hayatınızı kaybettiniz! Yeni bir oda başlatın.');
    }

    const { action } = dto;
    const currentState = room.current_state;

    // 1. Invoke AI Engine Strategy (Groq -> Gemini -> Fallback)
    const { result, providerUsed } = await this.aiEngineService.processAction(
      room.theme,
      currentState,
      action,
      room.history,
    );

    // 2. Compute State Machine Mutations
    let newHealth = currentState.health + (result.health_delta || 0);
    if (newHealth > 100) newHealth = 100;
    if (newHealth < 0) newHealth = 0;

    let newInventory = [...(currentState.inventory || [])];
    if (result.inventory_added && Array.isArray(result.inventory_added)) {
      newInventory = Array.from(new Set([...newInventory, ...result.inventory_added]));
    }
    if (result.inventory_removed && Array.isArray(result.inventory_removed)) {
      newInventory = newInventory.filter((item) => !result.inventory_removed.includes(item));
    }

    const newEnvironment = {
      ...(currentState.environment || {}),
      ...(result.environment_updates || {}),
    };

    let newStatus: 'active' | 'completed' | 'failed' = room.status;
    if (result.is_completed) {
      newStatus = 'completed';
    } else if (newHealth <= 0 || result.is_failed) {
      newStatus = 'failed';
    }

    const nextState = {
      health: newHealth,
      inventory: newInventory,
      environment: newEnvironment,
      discovered_clues: currentState.discovered_clues || [],
      room_status: newStatus.toUpperCase(),
    };

    const historyItem = {
      action,
      narrative: result.narrative,
      timestamp: new Date().toISOString(),
      providerUsed,
    };

    // 3. Atomic Database Update (Supabase PostgreSQL / JSONB)
    const updatedRoom = await this.supabaseService.updateRoomState(
      roomId,
      nextState,
      historyItem,
      newStatus,
    );

    return {
      roomId: updatedRoom.id,
      action,
      narrative: result.narrative,
      state: updatedRoom.current_state,
      suggestedActions: result.suggested_actions || [],
      soundEffect: result.sound_effect || 'default',
      status: updatedRoom.status,
      providerUsed,
    };
  }
}
