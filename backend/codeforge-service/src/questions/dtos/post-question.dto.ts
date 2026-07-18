/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Difficulty } from '../enums/difficulty.enum';
import { Type } from 'class-transformer';

export class PostQuestionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(96)
  title!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(Difficulty)
  @IsNotEmpty()
  difficulty!: Difficulty;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  timeLimit!: number;

  //createdBy
}
