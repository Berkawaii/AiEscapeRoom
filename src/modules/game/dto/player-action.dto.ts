import { IsString, IsNotEmpty } from 'class-validator';

export class PlayerActionDto {
  @IsString()
  @IsNotEmpty()
  action: string;
}
