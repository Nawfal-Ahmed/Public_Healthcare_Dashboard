const mongoose = require('mongoose');
const { Schema } = mongoose;

(async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/healthwatch');
    const User = mongoose.model('User', new Schema({}, { strict: false }), 'users');
    const docs = await User.find({}, { email: 1, role: 1, _id: 0 }).lean();
    console.log(JSON.stringify(docs, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
