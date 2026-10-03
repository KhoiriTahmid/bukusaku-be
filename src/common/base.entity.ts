import {
  CreatedAt,
  DeletedAt,
  Model,
  UpdatedAt,
} from 'sequelize-typescript';


export abstract class BaseModel<
  TModelAttributes extends {} = any,
  TCreationAttributes extends {} = TModelAttributes,
> extends Model<TModelAttributes, TCreationAttributes> {
  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date | null;
}