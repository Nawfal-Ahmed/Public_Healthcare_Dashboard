const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

(async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/healthwatch');
    const User = mongoose.model('User', new Schema({}, { strict: false }), 'users');

    const users = [
      {
        name: 'Admin',
        email: 'admin@health.gov',
        password: 'password123',
        role: 'admin',
        location: 'Health Ministry',
      },
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        role: 'user',
        location: 'City Center',
      },
    ];

    for (const userData of users) {
      const email = userData.email.toLowerCase();
      const existing = await User.findOne({ email });
      if (existing) {
        console.log(`User ${email} already exists`);
        continue;
      }
      const passwordHash = await bcrypt.hash(userData.password, 10);
      const newUser = await User.create({
        name: userData.name,
        email,
        passwordHash,
        role: userData.role,
        location: userData.location,
      });
      console.log(`Created user: ${email} role=${userData.role}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
