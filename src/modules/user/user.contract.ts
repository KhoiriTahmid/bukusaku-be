import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  DefaultFindAllRequest,
  PaginationMeta,
} from '../../helpers/pagination.helper';

export class UserFindAllRequest extends DefaultFindAllRequest {
  @ApiPropertyOptional({ description: 'Search by name or email' })
  @IsOptional()
  readonly search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  readonly roleId?: string;

  @ApiPropertyOptional({
    description: 'Set to "true" to list archived (soft deleted) users only',
  })
  @IsOptional()
  readonly isDeleted?: string;
}

export class UserRoleSummary {
  @ApiProperty()
  readonly roleId: string;

  @ApiProperty()
  readonly name: string;
}

export class UserFindOneResponse {
  @ApiProperty()
  readonly userId: string;

  @ApiProperty()
  readonly roleId: string;

  @ApiPropertyOptional({ type: UserRoleSummary, nullable: true })
  readonly role?: UserRoleSummary | null;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly email: string;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;

  @ApiPropertyOptional({ type: Date, nullable: true })
  readonly deletedAt?: Date | null;
}

export class UserFindAllResponse extends PaginationMeta {
  @ApiProperty({ type: [UserFindOneResponse] })
  readonly results: UserFindOneResponse[];
}

export class UserCreateRequest {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  readonly roleId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @ApiProperty({ maxLength: 100 })
  readonly name: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  @ApiProperty({ maxLength: 100 })
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @ApiProperty({ minLength: 8, maxLength: 72 })
  readonly password: string;
}

export class UserUpdateRequest {
  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional()
  readonly roleId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ApiPropertyOptional({ maxLength: 100 })
  readonly name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  @ApiPropertyOptional({ maxLength: 100 })
  readonly email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @ApiPropertyOptional({ minLength: 8, maxLength: 72 })
  readonly password?: string;
}

export class UserActionResponse {
  @ApiProperty()
  readonly isSuccess: boolean;

  @ApiProperty()
  readonly message: string;
}

export class OptionDeleteUserRequest {
  @ApiPropertyOptional({
    description:
      'Default behavior of delete is soft delete. Set forceDelete to "true" if you want to permanently delete the data',
  })
  readonly forceDelete: boolean;
}
