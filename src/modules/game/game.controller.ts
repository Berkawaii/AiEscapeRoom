import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GameService } from './game.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { PlayerActionDto } from './dto/player-action.dto';
import { DistributedLock } from '../../core/locks/distributed-lock.decorator';
import { DistributedLockInterceptor } from '../../core/locks/distributed-lock.interceptor';

@Controller('api/rooms')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  /**
   * Oda Oluştur
   * POST /api/rooms
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRoom(@Body() dto: CreateRoomDto) {
    return this.gameService.createRoom(dto);
  }

  /**
   * Oda Durumunu Getir
   * GET /api/rooms/:id
   */
  @Get(':id')
  async getRoom(@Param('id') id: string) {
    return this.gameService.getRoom(id);
  }

  /**
   * Oyuncu Aksiyonu Gönder (Atomic Distributed Lock Korumalı!)
   * POST /api/rooms/:id/action
   */
  @Post(':id/action')
  @UseInterceptors(DistributedLockInterceptor)
  @DistributedLock({ keyParam: 'id', ttlMs: 8000 })
  @HttpCode(HttpStatus.OK)
  async processAction(
    @Param('id') id: string,
    @Body() dto: PlayerActionDto,
  ) {
    return this.gameService.processAction(id, dto);
  }
}
