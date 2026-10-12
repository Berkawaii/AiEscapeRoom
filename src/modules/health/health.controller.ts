import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '../../core/database/supabase.service';

@Controller(['api/health', 'health'])
export class HealthController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async check() {
    const dbStatus = await this.supabaseService.ping();
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      renderKeepAlive: 'active',
      database: dbStatus,
    };
  }
}
