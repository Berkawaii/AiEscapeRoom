import { IsString, IsOptional } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsOptional()
  theme?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  lang?: 'tr' | 'en';
}
