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
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  UserActionResponse,
  UserCreateRequest,
  UserFindAllRequest,
  UserFindAllResponse,
  UserFindOneResponse,
  UserUpdateRequest,
} from './user.contract';

import { UserService } from './user.service';

const CONTEXT = 'user.controller';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get all users' })
  @Get()
  @ApiOkResponse({ type: UserFindAllResponse })
  async findAll(
    @Query() params: UserFindAllRequest,
  ): Promise<UserFindAllResponse> {
    try {
      Logger.log('--ENTER FIND ALL USERS--', CONTEXT);

      return await this.userService.findAll(params);
    } catch (error) {
      Logger.error('Find all users error: ' + JSON.stringify(error), CONTEXT);

      throw new HttpException(
        error?.message || error,
        error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Get one user' })
  @Get(':userId')
  @ApiOkResponse({ type: UserFindOneResponse })
  async findOne(@Param('userId') userId: string): Promise<UserFindOneResponse> {
    try {
      Logger.log('--ENTER FIND ONE USER--', CONTEXT);

      return await this.userService.findOne(userId);
    } catch (error) {
      Logger.error('Find one user error: ' + JSON.stringify(error), CONTEXT);

      throw new HttpException(
        error?.message || error,
        error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Create new user' })
  @Post()
  @ApiOkResponse({ type: UserFindOneResponse })
  async create(
    @Body() params: UserCreateRequest,
  ): Promise<UserFindOneResponse> {
    try {
      Logger.log('--ENTER CREATE USER--', CONTEXT);

      return await this.userService.create(params);
    } catch (error) {
      Logger.error('Create user error: ' + JSON.stringify(error), CONTEXT);

      throw new HttpException(
        error?.message || error,
        error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Update user' })
  @Patch(':userId')
  @ApiOkResponse({ type: UserFindOneResponse })
  async update(
    @Param('userId') userId: string,
    @Body() params: UserUpdateRequest,
  ): Promise<UserFindOneResponse> {
    try {
      Logger.log('--ENTER UPDATE USER--', CONTEXT);

      return await this.userService.update(userId, params);
    } catch (error) {
      Logger.error('Update user error: ' + JSON.stringify(error), CONTEXT);

      throw new HttpException(
        error?.message || error,
        error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Restore archived user' })
  @Post(':userId/restore')
  @ApiOkResponse({ type: UserActionResponse })
  async restore(@Param('userId') userId: string): Promise<UserActionResponse> {
    try {
      Logger.log('--ENTER RESTORE USER--', CONTEXT);

      const result = await this.userService.restore(userId);

      Logger.log(
        'User restored successfully: ' + JSON.stringify(result),
        CONTEXT,
      );

      return result;
    } catch (error) {
      Logger.error('Restore user error: ' + JSON.stringify(error), CONTEXT);

      throw new HttpException(
        error?.message || error,
        error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({
    summary: 'Delete user (supports soft delete and force delete)',
  })
  @Delete(':userId')
  @ApiOkResponse({ type: UserActionResponse })
  async delete(
    @Param('userId') userId: string,
    @Query('forceDelete') forceDelete?: string,
  ): Promise<UserActionResponse> {
    try {
      Logger.log('--ENTER DELETE USER--', CONTEXT);

      const isForceDelete = String(forceDelete) === 'true';

      const result = await this.userService.delete(userId, isForceDelete);

      Logger.log(
        'User deleted successfully: ' + JSON.stringify(result),
        CONTEXT,
      );

      return result;
    } catch (error) {
      Logger.error('Delete user error: ' + JSON.stringify(error), CONTEXT);

      throw new HttpException(
        error?.message || error,
        error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
