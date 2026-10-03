import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import {
  CreateRoleRequest,
  OptionDeleteRoleRequest,
  RoleActionResponse,
  RoleFindAllRequest,
  RoleFindAllResponse,
  RoleResponse,
  UpdateRoleRequest,
} from './role.contract';

import { RoleService } from './role.service';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../authentication/guards/permissions.guard';
import { Permissions } from '../authentication/decorators/permissions.decorator';

const CONTEXT = 'role.controller';

@ApiTags('Roles')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({ summary: 'Get all roles' })
  @Get()
  @ApiOkResponse({ type: RoleFindAllResponse })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('ROLES.LIST')
  async findAll(
    @Query() params: RoleFindAllRequest,
  ): Promise<RoleFindAllResponse> {
    try {
      Logger.log('--ENTER FIND ALL ROLES--', CONTEXT);

      return await this.roleService.findAll(params);
    } catch (error) {
      Logger.error('Find all roles error: ' + JSON.stringify(error), CONTEXT);

      throw new HttpException(
        error?.message || error,
        error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Get one role' })
  @Get(':roleId')
  @ApiOkResponse({ type: RoleResponse })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('ROLES.LIST')
  async findOne(@Param('roleId') roleId: string): Promise<RoleResponse> {
    try {
      Logger.log('--ENTER FIND ONE ROLE--', CONTEXT);

      return await this.roleService.findOne(roleId);
    } catch (error) {
      Logger.error('Find one role error: ' + JSON.stringify(error), CONTEXT);

      throw new HttpException(
        error?.message || error,
        error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Create new role' })
  @Post()
  @ApiOkResponse({ type: RoleResponse })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('ROLES.CREATE')
  async create(
    @Body() params: CreateRoleRequest,
    @Request() req,
  ): Promise<RoleResponse> {
    try {
      Logger.log('--ENTER CREATE ROLE--', CONTEXT);

      return await this.roleService.create(params, req.user.userId, req.user);
    } catch (error) {
      Logger.error('Create role error: ' + JSON.stringify(error), CONTEXT);

      throw new HttpException(
        error?.message || error,
        error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Update role' })
  @Patch(':roleId')
  @ApiOkResponse({ type: RoleResponse })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('ROLES.UPDATE')
  async update(
    @Request() req,
    @Param('roleId') roleId: string,
    @Body() params: UpdateRoleRequest,
  ): Promise<RoleResponse> {
    try {
      Logger.log('--ENTER UPDATE ROLE--', CONTEXT);

      return await this.roleService.update(
        roleId,
        params,
        req.user.userId,
        req.user,
      );
    } catch (error) {
      Logger.error('Update role error: ' + JSON.stringify(error), CONTEXT);

      throw new HttpException(
        error?.message || error,
        error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Restore archived role' })
  @Post(':roleId/restore')
  @ApiOkResponse({ type: RoleActionResponse })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('ROLES.DELETE')
  async restore(
    @Param('roleId') roleId: string,
    @Request() req,
  ): Promise<RoleActionResponse> {
    try {
      Logger.log('--ENTER RESTORE ROLE--', CONTEXT);

      const result = await this.roleService.restore(
        roleId,
        req.user.userId,
        req.user,
      );

      Logger.log(
        'Role restored successfully: ' + JSON.stringify(result),
        CONTEXT,
      );

      return result;
    } catch (error) {
      Logger.error('Restore role error: ' + JSON.stringify(error), CONTEXT);

      throw new HttpException(
        error?.message || error,
        error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({
    summary: 'Delete role (supports soft delete and force delete)',
  })
  @Delete(':roleId')
  @ApiOkResponse({ type: RoleActionResponse })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('ROLES.DELETE')
  async delete(
    @Param('roleId') roleId: string,
    @Request() req,
    @Query('forceDelete') forceDelete?: string,
  ): Promise<RoleActionResponse> {
    try {
      Logger.log('--ENTER DELETE ROLE--', CONTEXT);

      const options: OptionDeleteRoleRequest = {
        forceDelete: String(forceDelete) === 'true',
      };

      const result = await this.roleService.delete(
        roleId,
        req.user.userId,
        req.user,
        options,
      );

      Logger.log(
        'Role deleted successfully: ' + JSON.stringify(result),
        CONTEXT,
      );

      return result;
    } catch (error) {
      Logger.error('Delete role error: ' + JSON.stringify(error), CONTEXT);

      throw new HttpException(
        error?.message || error,
        error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
