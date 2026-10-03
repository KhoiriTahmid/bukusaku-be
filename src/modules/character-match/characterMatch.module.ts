import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Injectable,
  Module,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

// ---------- Contract ----------
export enum MatchMode {
  SENSITIVE = 'SENSITIVE',
  INSENSITIVE = 'INSENSITIVE',
}

export class CharacterMatchRequest {
  @ApiProperty({ example: 'ABBCD' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  readonly input1: string;

  @ApiProperty({ example: 'Gallant Duck' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  readonly input2: string;

  @ApiProperty({ enum: MatchMode, example: MatchMode.SENSITIVE })
  @IsEnum(MatchMode)
  readonly mode: MatchMode;
}

export class CharacterDetail {
  @ApiProperty() readonly char: string;
  @ApiProperty() readonly matched: boolean;
}

export class CharacterMatchResponse {
  @ApiProperty() readonly total: number;
  @ApiProperty() readonly matched: number;
  @ApiProperty() readonly percentage: number;
  @ApiProperty({ type: [CharacterDetail] }) readonly details: CharacterDetail[];
}

// ---------- Service ----------
@Injectable()
export class CharacterMatchService {
  check(
    input1: string,
    input2: string,
    mode: MatchMode,
  ): CharacterMatchResponse {
    const clean = (s: string) => {
      const text = s.replace(/\s/g, '');
      return mode === MatchMode.INSENSITIVE ? text.toLowerCase() : text;
    };

    const source = Array.from(clean(input1));
    const target = Array.from(clean(input2));

    if (source.length === 0 || target.length === 0) {
      throw new BadRequestException(
        'Both inputs must contain visible characters',
      );
    }

    const details = source.map((char) => ({
      char,
      matched: target.includes(char),
    }));

    const total = source.length;
    const matched = details.filter((d) => d.matched).length;
    const percentage = Math.round((matched / total) * 10000) / 100;

    return { total, matched, percentage, details };
  }
}

// ---------- Controller ----------
@ApiTags('Character Match')
@Controller('character-match')
export class CharacterMatchController {
  constructor(private readonly service: CharacterMatchService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Percentage of input1 characters found in input2' })
  @ApiOkResponse({ type: CharacterMatchResponse })
  check(@Body() body: CharacterMatchRequest) {
    return this.service.check(body.input1, body.input2, body.mode);
  }
}

// ---------- Module ----------
@Module({
  controllers: [CharacterMatchController],
  providers: [CharacterMatchService],
})
export class CharacterMatchModule {}
