'use strict';

const ROLE_ADMIN_ID = '0747b5d6-1a5c-4955-a9c9-91122884da99';
const ROLE_USER_ID = '4ce388ae-b756-47f3-bf32-9bb245f065b7';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert('roles', [
      {
        role_id: ROLE_ADMIN_ID,
        name: 'Super Admin',
        description: 'Super Admin',
        permissions: JSON.stringify({ FULL_ACCESS: 'TRUE' }),
        created_at: now,
        updated_at: now,
      },
      {
        role_id: ROLE_USER_ID,
        name: 'User',
        description: 'Base Functions',
        permissions: JSON.stringify({}),
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', {
      role_id: [ROLE_ADMIN_ID, ROLE_USER_ID],
    });
  },
};
