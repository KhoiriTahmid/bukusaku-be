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
  CreateTransactionRequest,
  OptionDeleteTransactionRequest,
  TransactionActionResponse,
  TransactionFindAllRequest,
  TransactionFindAllResponse,
  TransactionResponse,
  TransactionSummaryRequest,
  UpdateTransactionRequest,
} from './transaction.contract';

import { TransactionService } from './transaction.service';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../authentication/guards/permissions.guard';
import { Permissions } from '../authentication/decorators/permissions.decorator';

const CONTEXT = 'transaction.controller';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @ApiOperation({ summary: 'Get all transactions' })
  @Get()
  @ApiOkResponse({ type: TransactionFindAllResponse })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('TRANSACTIONS.LIST')
  async findAll(
    @Query() params: TransactionFindAllRequest,
  ): Promise<TransactionFindAllResponse> {
    try {
      Logger.log('--ENTER FIND ALL TRANSACTIONS--', CONTEXT);

      return await this.transactionService.findAll(params);
    } catch (error) {
      Logger.error(
        'Find all transactions error: ' + JSON.stringify(error),
        CONTEXT,
      );

      throw new HttpException(
        error?.message || error,
        error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('summary')
  @ApiOperation({ summary: 'Dashboard summary for the logged-in user' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('TRANSACTIONS.LIST')
  summary(@Request() req, @Query() query: TransactionSummaryRequest) {
    return this.transactionService.getSummary(req.user.userId, query.category);
  }

  @ApiOperation({ summary: 'Get one transaction' })
  @Get(':transactionId')
  @ApiOkResponse({ type: TransactionResponse })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('TRANSACTIONS.LIST')
  async findOne(
    @Param('transactionId') transactionId: string,
  ): Promise<TransactionResponse> {
    try {
      Logger.log('--ENTER FIND ONE TRANSACTION--', CONTEXT);

      return await this.transactionService.findOne(transactionId);
    } catch (error) {
      Logger.error(
        'Find one transaction error: ' + JSON.stringify(error),
        CONTEXT,
      );

      throw new HttpException(
        error?.message || error,
        error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Create new transaction' })
  @Post()
  @ApiOkResponse({ type: TransactionResponse })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('TRANSACTIONS.CREATE')
  async create(
    @Body() params: CreateTransactionRequest,
  ): Promise<TransactionResponse> {
    try {
      Logger.log('--ENTER CREATE TRANSACTION--', CONTEXT);

      return await this.transactionService.create(params);
    } catch (error) {
      Logger.error(
        'Create transaction error: ' + JSON.stringify(error),
        CONTEXT,
      );

      throw new HttpException(
        error?.message || error,
        error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Update transaction' })
  @Patch(':transactionId')
  @ApiOkResponse({ type: TransactionResponse })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('TRANSACTIONS.UPDATE')
  async update(
    @Param('transactionId') transactionId: string,
    @Body() params: UpdateTransactionRequest,
  ): Promise<TransactionResponse> {
    try {
      Logger.log('--ENTER UPDATE TRANSACTION--', CONTEXT);

      return await this.transactionService.update(transactionId, params);
    } catch (error) {
      Logger.error(
        'Update transaction error: ' + JSON.stringify(error),
        CONTEXT,
      );

      throw new HttpException(
        error?.message || error,
        error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Restore archived transaction' })
  @Post(':transactionId/restore')
  @ApiOkResponse({ type: TransactionActionResponse })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('TRANSACTIONS.DELETE')
  async restore(
    @Param('transactionId') transactionId: string,
  ): Promise<TransactionActionResponse> {
    try {
      Logger.log('--ENTER RESTORE TRANSACTION--', CONTEXT);

      const result = await this.transactionService.restore(transactionId);

      Logger.log(
        'Transaction restored successfully: ' + JSON.stringify(result),
        CONTEXT,
      );

      return result;
    } catch (error) {
      Logger.error(
        'Restore transaction error: ' + JSON.stringify(error),
        CONTEXT,
      );

      throw new HttpException(
        error?.message || error,
        error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({
    summary: 'Delete transaction (supports soft delete and force delete)',
  })
  @Delete(':transactionId')
  @ApiOkResponse({ type: TransactionActionResponse })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('TRANSACTIONS.DELETE')
  async delete(
    @Param('transactionId') transactionId: string,
    @Query('forceDelete') forceDelete?: string,
  ): Promise<TransactionActionResponse> {
    try {
      Logger.log('--ENTER DELETE TRANSACTION--', CONTEXT);

      const options: OptionDeleteTransactionRequest = {
        forceDelete: String(forceDelete) === 'true',
      };

      const result = await this.transactionService.delete(
        transactionId,
        options,
      );

      Logger.log(
        'Transaction deleted successfully: ' + JSON.stringify(result),
        CONTEXT,
      );

      return result;
    } catch (error) {
      Logger.error(
        'Delete transaction error: ' + JSON.stringify(error),
        CONTEXT,
      );

      throw new HttpException(
        error?.message || error,
        error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
