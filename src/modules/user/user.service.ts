import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { errorText } from '../../helpers/error.helper';
import { buildPagination } from '../../helpers/pagination.helper';
import { RoleModel } from '../role/role.entity';
import { UserModel } from './user.entity';
import {
  UserActionResponse,
  UserCreateRequest,
  UserFindAllRequest,
  UserFindAllResponse,
  UserFindOneResponse,
  UserUpdateRequest,
} from './user.contract';

const CONTEXT = 'user.service';
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10') || 10;

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserModel)
    private readonly userRepository: typeof UserModel,
    @InjectModel(RoleModel)
    private readonly roleRepository: typeof RoleModel,
  ) {}

  async findAll(params: UserFindAllRequest): Promise<UserFindAllResponse> {
    try {
      Logger.log('--ENTER FIND ALL USERS SERVICE--', CONTEXT);
      Logger.log(
        'find all users service params:' + JSON.stringify(params),
        CONTEXT,
      );

      let where: any = {};

      if (params.roleId) {
        where.roleId = params.roleId;
      }

      if (params.search) {
        where = {
          ...where,
          [Op.or]: [
            { name: { [Op.iLike]: `%${params.search}%` } },
            { email: { [Op.iLike]: `%${params.search}%` } },
          ],
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

      const { count, rows } = await this.userRepository.findAndCountAll({
        where,
        attributes: { exclude: ['password'] },
        include: [
          {
            model: RoleModel,
            attributes: ['roleId', 'name'],
            paranoid: false,
          },
        ],
        distinct: true,
        paranoid: !isArchiveMode,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      const results = rows.map((item) => item.get({ plain: true }));

      Logger.log(`Found ${results.length} users from ${count}`, CONTEXT);

      return {
        ...buildPagination(count, limit, offset),
        results,
      };
    } catch (error) {
      Logger.error('Find all users error:' + errorText(error), CONTEXT);
      return Promise.reject(error);
    }
  }

  async findOne(userId: string): Promise<UserFindOneResponse> {
    try {
      Logger.log('--ENTER FIND ONE USER SERVICE--', CONTEXT);
      Logger.log('find one user service id:' + userId, CONTEXT);

      // paranoid: false so archived users can still be looked up
      const result = await this.userRepository.findOne({
        where: { userId },
        attributes: { exclude: ['password'] },
        include: [
          {
            model: RoleModel,
            attributes: ['roleId', 'name'],
            paranoid: false,
          },
        ],
        paranoid: false,
      });

      if (!result) {
        return Promise.reject({
          statusCode: 404,
          code: 'user_not_found',
          message: 'User not found',
        });
      }

      return result.get({ plain: true });
    } catch (error) {
      Logger.error('Find one user error:' + errorText(error), CONTEXT);
      return Promise.reject(error);
    }
  }

  async create(params: UserCreateRequest): Promise<UserFindOneResponse> {
    try {
      Logger.log('--ENTER CREATE USER SERVICE--', CONTEXT);
      // Do not log the whole params object: it contains the plain password
      Logger.log('create user service email:' + params.email, CONTEXT);

      const email = params.email.trim().toLowerCase();

      // include archived users, the email unique constraint covers them too
      const emailTaken = await this.userRepository.findOne({
        where: { email },
        attributes: ['userId'],
        paranoid: false,
      });

      if (emailTaken) {
        return Promise.reject({
          statusCode: 409,
          code: 'email_already_used',
          message: 'Email is already used',
        });
      }

      const role = await this.roleRepository.findByPk(params.roleId, {
        attributes: ['roleId'],
      });

      if (!role) {
        return Promise.reject({
          statusCode: 400,
          code: 'role_not_found',
          message: 'Role not found',
        });
      }

      const result = await this.userRepository.create({
        roleId: params.roleId,
        name: params.name,
        email,
        password: await bcrypt.hash(params.password, SALT_ROUNDS),
      });

      Logger.log('Created user successfully, id:' + result.userId, CONTEXT);

      const { password, ...response } = result.get({ plain: true });

      return response;
    } catch (error) {
      Logger.error('Create user error:' + errorText(error), CONTEXT);
      return Promise.reject(error);
    }
  }

  async update(
    userId: string,
    params: UserUpdateRequest,
  ): Promise<UserFindOneResponse> {
    try {
      Logger.log('--ENTER UPDATE USER SERVICE--', CONTEXT);
      Logger.log('update user service id:' + userId, CONTEXT);

      if (!userId) {
        return Promise.reject({
          statusCode: 400,
          code: 'validation_error',
          message: 'User ID is required',
        });
      }

      const result = await this.userRepository.findOne({
        where: { userId },
        paranoid: false,
      });

      if (!result) {
        return Promise.reject({
          statusCode: 404,
          code: 'user_not_found',
          message: 'User not found',
        });
      }

      const payload: Partial<UserModel> = {};

      if (params.name !== undefined) {
        payload.name = params.name;
      }

      if (params.email !== undefined) {
        const email = params.email.trim().toLowerCase();

        if (email !== result.email) {
          const emailTaken = await this.userRepository.findOne({
            where: { email, userId: { [Op.ne]: userId } },
            attributes: ['userId'],
            paranoid: false,
          });

          if (emailTaken) {
            return Promise.reject({
              statusCode: 409,
              code: 'email_already_used',
              message: 'Email is already used',
            });
          }
        }

        payload.email = email;
      }

      if (params.roleId !== undefined && params.roleId !== result.roleId) {
        const role = await this.roleRepository.findByPk(params.roleId, {
          attributes: ['roleId'],
        });

        if (!role) {
          return Promise.reject({
            statusCode: 400,
            code: 'role_not_found',
            message: 'Role not found',
          });
        }

        payload.roleId = params.roleId;
      }

      if (params.password) {
        payload.password = await bcrypt.hash(params.password, SALT_ROUNDS);
      }

      const updated = await result.update(payload);

      const { password, ...response } = updated.get({ plain: true });

      return response;
    } catch (error) {
      Logger.error('Update user error:' + errorText(error), CONTEXT);
      return Promise.reject(error);
    }
  }

  async restore(userId: string): Promise<UserActionResponse> {
    try {
      Logger.log('--ENTER RESTORE USER SERVICE--', CONTEXT);
      Logger.log('restore user service id:' + userId, CONTEXT);

      if (!userId) {
        return Promise.reject({
          statusCode: 400,
          code: 'validation_error',
          message: 'User ID is required',
        });
      }

      const archived = await this.findOne(userId);

      if (!archived.deletedAt) {
        return Promise.reject({
          statusCode: 400,
          code: 'user_not_archived',
          message: 'User is not archived',
        });
      }

      await this.userRepository.restore({ where: { userId } });

      return {
        isSuccess: true,
        message: 'User restored successfully',
      };
    } catch (error) {
      Logger.error('Restore user error:' + errorText(error), CONTEXT);
      return Promise.reject(error);
    }
  }

  async delete(
    userId: string,
    isForceDelete = false,
  ): Promise<UserActionResponse> {
    try {
      Logger.log('--ENTER DELETE USER SERVICE--', CONTEXT);
      Logger.log('delete user service id:' + userId, CONTEXT);

      if (!userId) {
        return Promise.reject({
          statusCode: 400,
          code: 'validation_error',
          message: 'User ID is required',
        });
      }

      const existing = await this.findOne(userId);

      if (existing.deletedAt && !isForceDelete) {
        return Promise.reject({
          statusCode: 400,
          code: 'user_already_archived',
          message: 'User is already archived',
        });
      }

      const result = await this.userRepository.destroy({
        where: { userId },
        force: isForceDelete,
      });

      Logger.log(`Deleted ${result} user successfully`, CONTEXT);

      return {
        isSuccess: true,
        message: isForceDelete
          ? 'User permanently deleted successfully'
          : 'User archived successfully',
      };
    } catch (error) {
      Logger.error('Delete user error:' + errorText(error), CONTEXT);

      // Hard delete is blocked by ON DELETE RESTRICT when the user has transactions
      if (error?.name === 'SequelizeForeignKeyConstraintError') {
        return Promise.reject({
          statusCode: 409,
          code: 'user_has_related_data',
          message:
            'User still has related data (e.g. transactions) and cannot be permanently deleted',
        });
      }

      return Promise.reject(error);
    }
  }
}
