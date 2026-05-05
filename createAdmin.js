// Run this once: node createAdmin.js
// Creates the admin user in the database

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');

async function createAdmin() {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced.');

    const hashedPassword = await bcrypt.hash('123456', 10);

    const [admin, created] = await User.findOrCreate({
      where: { email: 'admin@pixelshop.dz' },
      defaults: {
        name: 'Admin',
        email: 'admin@pixelshop.dz',
        password: hashedPassword,
        role: 'admin',
      },
    });

    if (created) {
      console.log('✅ Admin user created successfully!');
    } else {
      console.log('ℹ️  Admin user already exists.');
    }

    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: 123456');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
