import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { errorText } from '../../helpers/error.helper';
import { buildPagination } from '../../helpers/pagination.helper';

import { UserModel } from '../user/user.entity';
import { TransactionModel } from './transaction.entity';
import { Op, fn, col, literal } from 'sequelize';

import {
  CreateTransactionRequest,
  OptionDeleteTransactionRequest,
  TransactionActionResponse,
  TransactionFindAllRequest,
  TransactionFindAllResponse,
  TransactionResponse,
  UpdateTransactionRequest,
} from './transaction.contract';

type Row = { month?: string; type?: string; total: string };

const CONTEXT = 'transaction.service';
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(TransactionModel)
    private readonly transactionRepository: typeof TransactionModel,
    @InjectModel(UserModel)
    private readonly userRepository: typeof UserModel,
  ) {}

  async findAll(
    params: TransactionFindAllRequest,
  ): Promise<TransactionFindAllResponse> {
    try {
      Logger.log('--ENTER FIND ALL TRANSACTIONS SERVICE--', CONTEXT);
      Logger.log(
        'find all transactions service params:' + JSON.stringify(params),
        CONTEXT,
      );

      let where: any = {};

      if (params.userId) {
        where.userId = params.userId;
      }

      if (params.type) {
        where.type = params.type;
      }

      if (params.category) {
        where.category = params.category;
      }

      if (params.search?.trim()) {
        const search = params.search?.trim();
        where = {
          ...where,
          [Op.or]: [{ description: { [Op.iLike]: `%${search}%` } }],
        };
      }

      const isArchiveMode = params.isDeleted === 'true';

      if (isArchiveMode) {
        where = {
          ...where,
          deletedAt: { [Op.ne]: null },
        };
      }

      const limit = Math.min(
        Math.max(Number(params.limit) || DEFAULT_LIMIT, 1),
        MAX_LIMIT,
      );

      const offset = Math.max(Number(params.offset) || 0, 0);

      const { count, rows } = await this.transactionRepository.findAndCountAll({
        where,
        paranoid: !isArchiveMode,
        limit,
        offset,
        order: [['transactionDate', 'DESC']],
        logging: console.log,
      });

      const results = rows.map((item) => item.get({ plain: true }));

      Logger.log(`Found ${results.length} transactions from ${count}`, CONTEXT);

      return {
        ...buildPagination(count, limit, offset),
        results,
      };
    } catch (error) {
      Logger.error('Find all transactions error:' + errorText(error), CONTEXT);
      return Promise.reject(error);
    }
  }

  async findOne(transactionId: string): Promise<TransactionResponse> {
    try {
      Logger.log('--ENTER FIND ONE TRANSACTION SERVICE--', CONTEXT);
      Logger.log('find one transaction service id:' + transactionId, CONTEXT);

      const result = await this.transactionRepository.findOne({
        where: { transactionId },
        paranoid: false,
      });

      if (!result) {
        return Promise.reject({
          statusCode: 404,
          code: 'transaction_not_found',
          message: 'Transaction not found',
        });
      }

      return result.get({ plain: true });
    } catch (error) {
      Logger.error('Find one transaction error:' + errorText(error), CONTEXT);
      return Promise.reject(error);
    }
  }

  async getSummary(userId: string, category?: string, monthsBack = 6) {
    const pad = (n: number) => String(n).padStart(2, '0');
    const ym = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    const now = new Date();
    const first = (offset: number) =>
      new Date(now.getFullYear(), now.getMonth() + offset, 1);

    const rangeStart = `${ym(first(-(monthsBack - 1)))}-01`;

    const base: any = { userId };
    if (category) base.category = category;

    const [totals, monthlyRows] = await Promise.all([
      this.transactionRepository.findAll({
        attributes: ['type', [fn('SUM', col('amount')), 'total']],
        where: base,
        group: ['type'],
        raw: true,
      }) as unknown as Promise<Row[]>,

      this.transactionRepository.findAll({
        attributes: [
          [
            literal(
              `to_char("TransactionModel"."transaction_date", 'YYYY-MM')`,
            ),
            'month',
          ],
          'type',
          [fn('SUM', col('amount')), 'total'],
        ],
        where: { ...base, transactionDate: { [Op.gte]: rangeStart } },
        group: ['month', 'type'],
        raw: true,
      }) as unknown as Promise<Row[]>,
    ]);

    const sum = (type: string) =>
      Number(totals.find((t) => t.type === type)?.total ?? 0);

    const monthly: { month: string; income: number; expense: number }[] = [];

    // nested loop dan neted IF code
    for (let i = 0; i < monthsBack; i++) {
      const m = ym(first(-(monthsBack - 1) + i));
      let income = 0;
      let expense = 0;

      for (const row of monthlyRows) {
        if (row.month === m) {
          if (row.type === 'INCOME') {
            income += Number(row.total);
          } else if (row.type === 'EXPENSE') {
            expense += Number(row.total);
          }
        }
      }

      monthly.push({ month: m, income, expense });
    }

    const current = monthly[monthsBack - 1];
    const previous = monthly[monthsBack - 2] ?? { income: 0, expense: 0 };

    return {
      balance: sum('INCOME') - sum('EXPENSE'),
      currentMonth: { income: current.income, expense: current.expense },
      previousMonth: { income: previous.income, expense: previous.expense },
      monthly,
    };
  }

  async create(params: CreateTransactionRequest): Promise<TransactionResponse> {
    try {
      Logger.log('--ENTER CREATE TRANSACTION SERVICE--', CONTEXT);
      Logger.log('create transaction service userId:' + params.userId, CONTEXT);

      const user = await this.userRepository.findByPk(params.userId, {
        attributes: ['userId'],
      });

      if (!user) {
        return Promise.reject({
          statusCode: 400,
          code: 'user_not_found',
          message: 'User not found',
        });
      }

      const result = await this.transactionRepository.create({
        userId: params.userId,
        type: params.type,
        category: params.category,
        amount: params.amount,
        description: params.description,
        transactionDate: params.transactionDate,
      });

      Logger.log(
        'Created transaction successfully, id:' + result.transactionId,
        CONTEXT,
      );

      return result.get({ plain: true });
    } catch (error) {
      Logger.error('Create transaction error:' + errorText(error), CONTEXT);
      return Promise.reject(error);
    }
  }

  async update(
    transactionId: string,
    params: UpdateTransactionRequest,
  ): Promise<TransactionResponse> {
    try {
      Logger.log('--ENTER UPDATE TRANSACTION SERVICE--', CONTEXT);
      Logger.log('update transaction service id:' + transactionId, CONTEXT);

      if (!transactionId) {
        return Promise.reject({
          statusCode: 400,
          code: 'validation_error',
          message: 'Transaction ID is required',
        });
      }

      const result = await this.transactionRepository.findOne({
        where: { transactionId },
        paranoid: false,
      });

      if (!result) {
        return Promise.reject({
          statusCode: 404,
          code: 'transaction_not_found',
          message: 'Transaction not found',
        });
      }

      const payload: Partial<TransactionModel> = {};

      if (params.type !== undefined) {
        payload.type = params.type;
      }

      if (params.category !== undefined) {
        payload.category = params.category;
      }

      if (params.amount !== undefined) {
        payload.amount = params.amount;
      }

      if (params.description !== undefined) {
        payload.description = params.description;
      }

      if (params.transactionDate !== undefined) {
        payload.transactionDate = new Date(params.transactionDate);
      }

      const updated = await result.update(payload);

      return updated.get({ plain: true });
    } catch (error) {
      Logger.error('Update transaction error:' + errorText(error), CONTEXT);
      return Promise.reject(error);
    }
  }

  async restore(transactionId: string): Promise<TransactionActionResponse> {
    try {
      Logger.log('--ENTER RESTORE TRANSACTION SERVICE--', CONTEXT);
      Logger.log('restore transaction service id:' + transactionId, CONTEXT);

      if (!transactionId) {
        return Promise.reject({
          statusCode: 400,
          code: 'validation_error',
          message: 'Transaction ID is required',
        });
      }

      const archived = await this.findOne(transactionId);

      if (!archived.deletedAt) {
        return Promise.reject({
          statusCode: 400,
          code: 'transaction_not_archived',
          message: 'Transaction is not archived',
        });
      }

      await this.transactionRepository.restore({
        where: { transactionId },
      });

      return {
        isSuccess: true,
        message: 'Transaction restored successfully',
      };
    } catch (error) {
      Logger.error('Restore transaction error:' + errorText(error), CONTEXT);
      return Promise.reject(error);
    }
  }

  async delete(
    transactionId: string,
    options?: OptionDeleteTransactionRequest,
  ): Promise<TransactionActionResponse> {
    try {
      Logger.log('--ENTER DELETE TRANSACTION SERVICE--', CONTEXT);
      Logger.log('delete transaction service id:' + transactionId, CONTEXT);

      if (!transactionId) {
        return Promise.reject({
          statusCode: 400,
          code: 'validation_error',
          message: 'Transaction ID is required',
        });
      }

      const isForceDelete = options?.forceDelete === true;

      const existing = await this.findOne(transactionId);

      if (existing.deletedAt && !isForceDelete) {
        return Promise.reject({
          statusCode: 400,
          code: 'transaction_already_archived',
          message: 'Transaction is already archived',
        });
      }

      const result = await this.transactionRepository.destroy({
        where: { transactionId },
        force: isForceDelete,
      });

      Logger.log(`Deleted ${result} transaction successfully`, CONTEXT);

      return {
        isSuccess: true,
        message: isForceDelete
          ? 'Transaction permanently deleted successfully'
          : 'Transaction archived successfully',
      };
    } catch (error) {
      Logger.error('Delete transaction error:' + errorText(error), CONTEXT);

      if (error?.name === 'SequelizeForeignKeyConstraintError') {
        return Promise.reject({
          statusCode: 409,
          code: 'transaction_has_related_data',
          message:
            'Transaction still has related data and cannot be permanently deleted',
        });
      }

      return Promise.reject(error);
    }
  }
}
