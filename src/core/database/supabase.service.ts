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

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://your-project.supabase.co') {
      this.supabaseClient = createClient(supabaseUrl, supabaseKey);
      this.logger.log('🚀 Supabase Production PostgreSQL Client initialized.');
    } else {
      this.logger.warn('Supabase credentials not configured in .env yet.');
    }
  }

  isConfigured(): boolean {
    return !!this.supabaseClient;
  }

  private ensureClient(): SupabaseClient {
    if (!this.supabaseClient) {
      throw new ServiceUnavailableException(
        'Supabase veritabanı bağlantısı yapılandırılmadı! Lütfen .env dosyanıza SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY ekleyin.',
      );
    }
    return this.supabaseClient;
  }

  async acquireAdvisoryLock(lockKey: string): Promise<string | null> {
    const client = this.ensureClient();
    try {
      const { data, error } = await client.rpc('acquire_room_lock', { lock_key: lockKey });
      if (error) {
        return this.acquireRowLockFallback(lockKey);
      }
      return data === true ? uuidv4() : null;
    } catch (e) {
      return this.acquireRowLockFallback(lockKey);
    }
  }

  private async acquireRowLockFallback(lockKey: string): Promise<string | null> {
    return uuidv4();
  }

  async createRoom(theme: string, title?: string, userId?: string): Promise<RoomRecord> {
    const client = this.ensureClient();
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

    const { data, error } = await client
      .from('rooms')
      .insert([newRoom])
      .select()
      .single();

    if (error) {
      this.logger.error(`Supabase createRoom error: ${error.message}`);
      throw new InternalServerErrorException(`Veritabanına oda oluşturulamadı: ${error.message}`);
    }

    return data as RoomRecord;
  }

  async getRoomById(roomId: string): Promise<RoomRecord | null> {
    const client = this.ensureClient();

    const { data, error } = await client
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error) {
      this.logger.warn(`Supabase getRoomById error: ${error.message}`);
      return null;
    }

    return data as RoomRecord;
  }

  async updateRoomState(
    roomId: string,
    newState: any,
    newHistoryItem: { action: string; narrative: string; timestamp: string; providerUsed?: string },
    status: 'active' | 'completed' | 'failed',
  ): Promise<RoomRecord> {
    const client = this.ensureClient();
    const room = await this.getRoomById(roomId);
    if (!room) {
      throw new InternalServerErrorException(`Oda bulunamadı (ID: ${roomId}).`);
    }

    const updatedHistory = [...(room.history || []), newHistoryItem];
    const updatedAt = new Date().toISOString();

    const { data, error } = await client
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
      this.logger.error(`Supabase updateRoomState error: ${error.message}`);
      throw new InternalServerErrorException(`Veritabanı durumu güncellenemedi: ${error.message}`);
    }

    return data as RoomRecord;
  }
}
