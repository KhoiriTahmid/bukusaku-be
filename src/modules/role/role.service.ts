import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { errorText } from '../../helpers/error.helper';
import { buildPagination } from '../../helpers/pagination.helper';
import { RoleModel } from './role.entity';

import {
  CreateRoleRequest,
  OptionDeleteRoleRequest,
  RoleActionResponse,
  RoleFindAllRequest,
  RoleFindAllResponse,
  RoleResponse,
  UpdateRoleRequest,
} from './role.contract';

const CONTEXT = 'role.service';
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(RoleModel)
    private readonly roleRepository: typeof RoleModel,
  ) {}

  async findAll(params: RoleFindAllRequest): Promise<RoleFindAllResponse> {
    try {
      Logger.log('--ENTER FIND ALL ROLES SERVICE--', CONTEXT);
      Logger.log(
        'find all roles service params:' + JSON.stringify(params),
        CONTEXT,
      );

      let where: any = {};

      if (params.search) {
        where = {
          ...where,
          name: { [Op.iLike]: `%${params.search}%` },
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

      const { count, rows } = await this.roleRepository.findAndCountAll({
        where,
        paranoid: !isArchiveMode,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      const results = rows.map((item) => item.get({ plain: true }));

      Logger.log(`Found ${results.length} roles from ${count}`, CONTEXT);

      return {
        ...buildPagination(count, limit, offset),
        results,
      };
    } catch (error) {
      Logger.error('Find all roles error:' + errorText(error), CONTEXT);
      return Promise.reject(error);
    }
  }

  async findOne(roleId: string): Promise<RoleResponse> {
    try {
      Logger.log('--ENTER FIND ONE ROLE SERVICE--', CONTEXT);
      Logger.log('find one role service id:' + roleId, CONTEXT);

      const result = await this.roleRepository.findOne({
        where: { roleId },
        paranoid: false,
      });

      if (!result) {
        return Promise.reject({
          statusCode: 404,
          code: 'role_not_found',
          message: 'Role not found',
        });
      }

      return result.get({ plain: true });
    } catch (error) {
      Logger.error('Find one role error:' + errorText(error), CONTEXT);
      return Promise.reject(error);
    }
  }

  async create(params: CreateRoleRequest): Promise<RoleResponse> {
    try {
      Logger.log('--ENTER CREATE ROLE SERVICE--', CONTEXT);
      Logger.log('create role service name:' + params.name, CONTEXT);

      const name = params.name.trim();

      const existing = await this.roleRepository.findOne({
        where: { name },
        attributes: ['roleId'],
        paranoid: false,
      });

      if (existing) {
        return Promise.reject({
          statusCode: 409,
          code: 'role_name_already_used',
          message: 'Role name is already used',
        });
      }

      const result = await this.roleRepository.create({
        name,
        description: params.description,
        permissions: params.permissions,
      });

      Logger.log('Created role successfully, id:' + result.roleId, CONTEXT);

      return result.get({ plain: true });
    } catch (error) {
      Logger.error('Create role error:' + errorText(error), CONTEXT);
      return Promise.reject(error);
    }
  }

  async update(
    roleId: string,
    params: UpdateRoleRequest,
  ): Promise<RoleResponse> {
    try {
      Logger.log('--ENTER UPDATE ROLE SERVICE--', CONTEXT);
      Logger.log('update role service id:' + roleId, CONTEXT);

      if (!roleId) {
        return Promise.reject({
          statusCode: 400,
          code: 'validation_error',
          message: 'Role ID is required',
        });
      }

      const result = await this.roleRepository.findOne({
        where: { roleId },
        paranoid: false,
      });

      if (!result) {
        return Promise.reject({
          statusCode: 404,
          code: 'role_not_found',
          message: 'Role not found',
        });
      }

      const payload: Partial<RoleModel> = {};

      if (params.name !== undefined) {
        const name = params.name.trim();

        if (name !== result.name) {
          const existing = await this.roleRepository.findOne({
            where: {
              name,
              roleId: { [Op.ne]: roleId },
            },
            attributes: ['roleId'],
            paranoid: false,
          });

          if (existing) {
            return Promise.reject({
              statusCode: 409,
              code: 'role_name_already_used',
              message: 'Role name is already used',
            });
          }
        }

        payload.name = name;
      }

      if (params.description !== undefined) {
        payload.description = params.description;
      }

      if (params.permissions !== undefined) {
        payload.permissions = params.permissions;
      }

      const updated = await result.update(payload);

      return updated.get({ plain: true });
    } catch (error) {
      Logger.error('Update role error:' + errorText(error), CONTEXT);
      return Promise.reject(error);
    }
  }

  async restore(roleId: string): Promise<RoleActionResponse> {
    try {
      Logger.log('--ENTER RESTORE ROLE SERVICE--', CONTEXT);
      Logger.log('restore role service id:' + roleId, CONTEXT);

      if (!roleId) {
        return Promise.reject({
          statusCode: 400,
          code: 'validation_error',
          message: 'Role ID is required',
        });
      }

      const archived = await this.findOne(roleId);

      if (!archived.deletedAt) {
        return Promise.reject({
          statusCode: 400,
          code: 'role_not_archived',
          message: 'Role is not archived',
        });
      }

      await this.roleRepository.restore({ where: { roleId } });

      return {
        isSuccess: true,
        message: 'Role restored successfully',
      };
    } catch (error) {
      Logger.error('Restore role error:' + errorText(error), CONTEXT);
      return Promise.reject(error);
    }
  }

  async delete(
    roleId: string,
    options?: OptionDeleteRoleRequest,
  ): Promise<RoleActionResponse> {
    try {
      Logger.log('--ENTER DELETE ROLE SERVICE--', CONTEXT);
      Logger.log('delete role service id:' + roleId, CONTEXT);

      if (!roleId) {
        return Promise.reject({
          statusCode: 400,
          code: 'validation_error',
          message: 'Role ID is required',
        });
      }

      const isForceDelete = options?.forceDelete === true;

      const existing = await this.findOne(roleId);

      if (existing.deletedAt && !isForceDelete) {
        return Promise.reject({
          statusCode: 400,
          code: 'role_already_archived',
          message: 'Role is already archived',
        });
      }

      const result = await this.roleRepository.destroy({
        where: { roleId },
        force: isForceDelete,
      });

      Logger.log(`Deleted ${result} role successfully`, CONTEXT);

      return {
        isSuccess: true,
        message: isForceDelete
          ? 'Role permanently deleted successfully'
          : 'Role archived successfully',
      };
    } catch (error) {
      Logger.error('Delete role error:' + errorText(error), CONTEXT);

      if (error?.name === 'SequelizeForeignKeyConstraintError') {
        return Promise.reject({
          statusCode: 409,
          code: 'role_has_related_data',
          message:
            'Role still has related users or data and cannot be permanently deleted',
        });
      }

      return Promise.reject(error);
    }
  }
}
