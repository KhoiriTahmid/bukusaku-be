'use strict';

const bcrypt = require('bcrypt');

const ROLE_ADMIN_ID = '0747b5d6-1a5c-4955-a9c9-91122884da99';
const USER_ADMIN_ID = 'b1f0c6a2-7d34-4c5e-9a1b-3e8f2d6c4a10';

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);

    await queryInterface.bulkInsert('users', [
      {
        user_id: USER_ADMIN_ID,
        role_id: ROLE_ADMIN_ID,
        name: 'Super Admin',
        email: ADMIN_EMAIL,
        password: hashedPassword,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      user_id: USER_ADMIN_ID,
    });
  },
};
