'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('change_logs', {
      changelog_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'user_id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      meta_user: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      table_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      external_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      action: {
        type: Sequelize.ENUM(
          'CREATE',
          'UPDATE',
          'SOFT_DELETE',
          'HARD_DELETE',
          'RESTORE',
        ),
        allowNull: false,
      },
      old_values: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      new_values: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('change_logs');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_change_logs_action";',
    );
  },
};
