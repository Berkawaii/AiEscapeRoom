import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class PlayerActionDto {
  @IsString()
  @IsNotEmpty()
  action: string;

  @IsString()
  @IsOptional()
  lang?: 'tr' | 'en';

  @IsString()
  @IsOptional()
  provider?: 'groq' | 'gemini' | 'auto';
}
