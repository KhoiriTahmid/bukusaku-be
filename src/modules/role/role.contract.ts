import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  DefaultFindAllRequest,
  PaginationMeta,
} from '../../helpers/pagination.helper';

export class RoleFindAllRequest extends DefaultFindAllRequest {
  @ApiPropertyOptional({ description: 'Set to "true" to list archived only' })
  @IsOptional()
  readonly isDeleted?: string;
}

export class RoleResponse {
  @ApiProperty()
  readonly roleId: string;

  @ApiProperty() readonly name: string;

  @ApiPropertyOptional()
  readonly description?: string;

  @ApiPropertyOptional()
  readonly permissions?: any;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;

  @ApiPropertyOptional()
  readonly deletedAt?: Date;
}

export class RoleFindAllResponse extends PaginationMeta {
  @ApiProperty({ type: [RoleResponse] })
  readonly results: RoleResponse[];
}

export class CreateRoleRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  readonly permissions?: any;
}

export class UpdateRoleRequest {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  readonly permissions?: any;
}

export class RoleActionResponse {
  @ApiProperty()
  readonly isSuccess: boolean;

  @ApiProperty()
  readonly message: string;
}

export class OptionDeleteRoleRequest {
  @ApiPropertyOptional({
    description:
      'Default behavior of delete is soft delete. Set forceDelete to "true" if you want to permanently delete the data',
  })
  readonly forceDelete: boolean;
}
