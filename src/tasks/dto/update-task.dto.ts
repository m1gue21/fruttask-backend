import {
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateTaskDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  title?: string;

  
  @IsString()
  @IsOptional()
  description: string;


  @IsString()
  @IsOptional()
  status: string;
  
}
