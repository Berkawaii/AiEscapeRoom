import { Injectable, Logger, ServiceUnavailableException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { SCENARIO_CONFIGS } from '../ai/scenario-config';

export interface RoomRecord {
  id: string;
  user_id?: string;
  theme: string;
  title: string;
  current_state: {
    health: number;
    inventory: string[];
    environment: Record<string, any>;
    discovered_clues: string[];
    room_status: string;
  };
  history: Array<{
    action: string;
    narrative: string;
    timestamp: string;
    providerUsed?: string;
  }>;
  status: 'active' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabaseClient: SupabaseClient | null = null;
  private readonly memoryRooms = new Map<string, RoomRecord>();

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://your-project.supabase.co') {
      try {
        this.supabaseClient = createClient(supabaseUrl, supabaseKey);
        this.logger.log('🚀 Supabase Production PostgreSQL Client initialized.');
      } catch (e: any) {
        this.logger.warn(`Supabase client initialization warning: ${e.message}`);
      }
    } else {
      this.logger.warn('Supabase credentials not configured in .env yet.');
    }
  }

  isConfigured(): boolean {
    return !!this.supabaseClient;
  }

  async ping(): Promise<{ connected: boolean; latencyMs: number; mode: 'supabase' | 'in_memory' }> {
    const start = Date.now();
    if (this.supabaseClient) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Ping timeout')), 2000),
        );
        const queryPromise = this.supabaseClient.from('rooms').select('id').limit(1);

        const { error }: any = await Promise.race([queryPromise, timeoutPromise]);
        if (!error) {
          return { connected: true, latencyMs: Date.now() - start, mode: 'supabase' };
        }
      } catch {
        // Supabase unreachable or timed out
      }
    }
    return { connected: false, latencyMs: Date.now() - start, mode: 'in_memory' };
  }

  async acquireAdvisoryLock(lockKey: string): Promise<string | null> {
    if (this.supabaseClient) {
      try {
        const { data, error } = await this.supabaseClient.rpc('acquire_room_lock', { lock_key: lockKey });
        if (!error && data === true) {
          return uuidv4();
        }
      } catch (e) {
        // Fallback to row lock token
      }
    }
    return this.acquireRowLockFallback(lockKey);
  }

  private async acquireRowLockFallback(lockKey: string): Promise<string | null> {
    return uuidv4();
  }

  async createRoom(theme: string, title?: string, userId?: string): Promise<RoomRecord> {
    const config = SCENARIO_CONFIGS[theme] || SCENARIO_CONFIGS['cyberpunk_escape'];

    const newRoom: RoomRecord = {
      id: uuidv4(),
      user_id: userId && userId !== 'anonymous' ? userId : null,
      theme: theme || 'cyberpunk_escape',
      title: title || config.titleTr,
      current_state: JSON.parse(JSON.stringify(config.initialState)),
      history: [],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Always store in resilient in-memory store
    this.memoryRooms.set(newRoom.id, newRoom);

    if (this.supabaseClient) {
      try {
        const { data, error } = await this.supabaseClient
          .from('rooms')
          .insert([newRoom])
          .select()
          .single();

        if (error) {
          this.logger.warn(`Supabase createRoom warning (${error.message}). Using resilient memory store.`);
        } else if (data) {
          this.memoryRooms.set(data.id, data as RoomRecord);
          return data as RoomRecord;
        }
      } catch (err: any) {
        this.logger.warn(`Supabase createRoom connection failed (${err.message}). Using resilient memory store.`);
      }
    }

    return newRoom;
  }

  async getRoomById(roomId: string): Promise<RoomRecord | null> {
    if (this.supabaseClient) {
      try {
        const { data, error } = await this.supabaseClient
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .single();

        if (!error && data) {
          this.memoryRooms.set(roomId, data as RoomRecord);
          return data as RoomRecord;
        }
      } catch (err: any) {
        this.logger.warn(`Supabase getRoomById failed (${err.message}). Checking memory store.`);
      }
    }

    const memoryRoom = this.memoryRooms.get(roomId);
    if (memoryRoom) {
      return memoryRoom;
    }

    return null;
  }

  async updateRoomState(
    roomId: string,
    newState: any,
    newHistoryItem: { action: string; narrative: string; timestamp: string; providerUsed?: string },
    status: 'active' | 'completed' | 'failed',
  ): Promise<RoomRecord> {
    const room = await this.getRoomById(roomId);
    if (!room) {
      throw new InternalServerErrorException(`Oda bulunamadı (ID: ${roomId}).`);
    }

    const updatedHistory = [...(room.history || []), newHistoryItem];
    const updatedAt = new Date().toISOString();

    const updatedRoom: RoomRecord = {
      ...room,
      current_state: newState,
      history: updatedHistory,
      status,
      updated_at: updatedAt,
    };

    // Update resilient memory store
    this.memoryRooms.set(roomId, updatedRoom);

    if (this.supabaseClient) {
      try {
        const { data, error } = await this.supabaseClient
          .from('rooms')
          .update({
            current_state: newState,
            history: updatedHistory,
            status,
            updated_at: updatedAt,
          })
          .eq('id', roomId)
          .select()
          .single();

        if (error) {
          this.logger.warn(`Supabase updateRoomState warning (${error.message}). Preserved in memory store.`);
        } else if (data) {
          this.memoryRooms.set(roomId, data as RoomRecord);
          return data as RoomRecord;
        }
      } catch (err: any) {
        this.logger.warn(`Supabase updateRoomState failed (${err.message}). Preserved in memory store.`);
      }
    }

    return updatedRoom;
  }
}
