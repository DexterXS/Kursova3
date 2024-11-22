const mongoose = require('mongoose');

// Подключение к MongoDB
const dbURI = 'mongodb+srv://salnikolyasik:root@cluster0.88buj.mongodb.net/';
mongoose.connect(dbURI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log('Error connecting to MongoDB:', err);
  });

// Схема для коллекции "users"
const userSchema = new mongoose.Schema({
  nickname: String,
  password: String
});
const User = mongoose.model('User', userSchema);

// Схема для коллекции "admins"
const adminSchema = new mongoose.Schema({
  nickname: String,
  password: String
});
const Admin = mongoose.model('Admin', adminSchema);

const personnelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  gender: { type: String, required: true },
  birthday: { type: Date, required: true },
  unit: { type: String, required: true },
  rank: { type: String, required: true },
  health: { type: String, required: true },
  notes: [
    {
      text: { type: String, required: true },
      admin: { type: String, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
});

 
const Personnel = mongoose.model('Personnel', personnelSchema);

module.exports = { User, Admin, Personnel };

// Экспорт моделей

