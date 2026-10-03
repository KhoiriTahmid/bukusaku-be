import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  IsUUID,
} from 'class-validator';
import {
  DefaultFindAllRequest,
  PaginationMeta,
} from '../../helpers/pagination.helper';

export class TransactionSummaryRequest {
  @ApiPropertyOptional({ description: 'Limit the summary to one category' })
  @IsOptional()
  @IsString()
  readonly category?: string;
}
export class TransactionFindAllRequest extends DefaultFindAllRequest {
  @ApiPropertyOptional()
  @IsOptional()
  readonly userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  readonly category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['INCOME', 'EXPENSE'])
  readonly type?: 'INCOME' | 'EXPENSE';

  @ApiPropertyOptional({ description: 'Set to "true" to list archived only' })
  @IsOptional()
  readonly isDeleted?: string;
}

export class TransactionResponse {
  @ApiProperty()
  readonly transactionId: string;

  @ApiProperty()
  readonly userId: string;

  @ApiProperty()
  readonly type: string;

  @ApiProperty()
  readonly category: string;

  @ApiProperty()
  readonly amount: number;

  @ApiPropertyOptional()
  readonly description?: string;

  @ApiProperty()
  readonly transactionDate: Date;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;

  @ApiPropertyOptional()
  readonly deletedAt?: Date;
}

export class TransactionFindAllResponse extends PaginationMeta {
  @ApiProperty({ type: [TransactionResponse] })
  readonly results: TransactionResponse[];
}

export class CreateTransactionRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  readonly userId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(['INCOME', 'EXPENSE'])
  readonly type: 'INCOME' | 'EXPENSE';

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly category: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  readonly amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  readonly transactionDate: string;
}

export class UpdateTransactionRequest {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['INCOME', 'EXPENSE'])
  readonly type?: 'INCOME' | 'EXPENSE';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  readonly amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  readonly transactionDate?: string;
}

export class TransactionActionResponse {
  @ApiProperty() readonly isSuccess: boolean;
  @ApiProperty() readonly message: string;
}

export class OptionDeleteTransactionRequest {
  @ApiPropertyOptional({
    description:
      'Default behavior of delete is soft delete. Set forceDelete to "true" if you want to permanently delete the data',
  })
  readonly forceDelete: boolean;
}
