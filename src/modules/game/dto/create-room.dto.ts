import { IsString, IsOptional } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsOptional()
  theme?: string;

  @IsString()
  @IsOptional()
  title?: string;
}
