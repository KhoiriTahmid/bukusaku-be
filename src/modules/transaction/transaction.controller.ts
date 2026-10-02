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
  CreateTransactionRequest,
  OptionDeleteTransactionRequest,
  TransactionActionResponse,
  TransactionFindAllRequest,
  TransactionFindAllResponse,
  TransactionResponse,
  UpdateTransactionRequest,
} from './transaction.contract';

import { TransactionService } from './transaction.service';

const CONTEXT = 'transaction.controller';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @ApiOperation({ summary: 'Get all transactions' })
  @Get()
  @ApiOkResponse({ type: TransactionFindAllResponse })
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

  @ApiOperation({ summary: 'Get one transaction' })
  @Get(':transactionId')
  @ApiOkResponse({ type: TransactionResponse })
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
