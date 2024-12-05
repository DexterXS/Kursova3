const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();

// Middleware для обработки JSON и CORS
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Подключение к MongoDB
const dbURI = 'mongodb+srv://salnikolyasik:root@cluster0.88buj.mongodb.net/';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Импорт моделей
const { User, Admin, Personnel } = require('./Mongo');

// Маршруты для статических файлов
app.use(express.static(path.join(__dirname, 'views')));

app.get('/admin/manage-users', (req, res) => {
  // Отправляем HTML страницу, которая будет показывать управление пользователями
  res.sendFile(path.join(__dirname, 'views', 'manage-users.html'));
});

// Маршрут для страницы Dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname,   'views', 'dashboard.html'));
})

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Регистрация пользователя
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

// Логин администратора
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin-login.html'));
});

// API для регистрации пользователя
app.post('/register', async (req, res) => {
  const { nickname, password } = req.body;
  if (!nickname || !password) {
    return res.status(400).json({ message: 'Nickname and password are required' });
  }
  try {
    const existingUser = await User.findOne({ nickname });
    if (existingUser) {
      return res.status(409).json({ message: 'Nickname already taken' });
    }
    const newUser = new User({ nickname, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Страница панели администратора
app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin-dashboard.html')); // Убедитесь, что admin-dashboard.html существует в папке views
});


// API для логина пользователя
app.post('/login', async (req, res) => {
  const { nickname, password } = req.body;
  if (!nickname || !password) {
    return res.status(400).json({ message: 'Nickname and password are required' });
  }
  try {
    const user = await User.findOne({ nickname });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.status(200).json({ redirectUrl: '/dashboard' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// API для логина администратора
app.post('/admin/login', async (req, res) => {
  const { nickname, password } = req.body;
  if (!nickname || !password) {
    return res.status(400).json({ message: 'Nickname and password are required' });
  }
  try {
    const admin = await Admin.findOne({ nickname });
    if (!admin || admin.password !== password) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
    res.status(200).json({ redirectUrl: '/admin/dashboard' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// API для получения данных о персонале
app.get('/admin/personnel', async (req, res) => {
  try {
    const personnelData = await Personnel.find();
    res.json(personnelData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching personnel data', error });
  }
});

// API для получения данных о персонале по ID
app.get('/personnel/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid personnel ID' });
  }
  try {
    const person = await Personnel.findById(id);
    if (!person) {
      return res.status(404).json({ message: 'Personnel not found' });
    }
    res.json(person);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching personnel details', error });
  }
});

// API для добавления нового персонала
app.post('/admin/personnel', async (req, res) => {
  const { name, surname, gender, birthday, unit, rank, health } = req.body;

  if (!name || !surname || !gender || !birthday || !unit || !rank || !health) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newPersonnel = new Personnel({
      name,
      surname,
      gender,
      birthday,
      unit,
      rank,
      health,
    });

    await newPersonnel.save();
    res.status(201).json(newPersonnel);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add personnel', error });
  }
});

// API для обновления записи о персонале
app.put('/admin/personnel/:id', async (req, res) => {
  const { id } = req.params;
  const { name, surname, gender, birthday, unit, rank, health } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid personnel ID' });
  }

  try {
    const updatedPerson = await Personnel.findByIdAndUpdate(
      id,
      { name, surname, gender, birthday, unit, rank, health },
      { new: true, runValidators: true }
    );

    if (!updatedPerson) {
      return res.status(404).json({ message: 'Personnel not found' });
    }

    res.status(200).json(updatedPerson);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update personnel', error });
  }
});

// API для удаления записи о персонале
app.delete('/admin/personnel/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid personnel ID' });
  }

  try {
    const deletedPerson = await Personnel.findByIdAndDelete(id);
    if (!deletedPerson) {
      return res.status(404).json({ message: 'Personnel not found' });
    }

    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting record', error });
  }
});
// Страница добавления нового персонала
app.get('/admin/add-personnel', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'add-personnel.html'));
});
// API для получения списка персонала
app.get('/admin/personnel', async (req, res) => {
  try {
    const personnelData = await Personnel.find();
    res.json(personnelData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching personnel data', error });
  }
});

// API для добавления заметок
app.post('/personnel/:id/notes', async (req, res) => {
  const { id } = req.params;
  const { text, admin } = req.body;

  if (!text || !admin) {
    return res.status(400).json({ message: 'Text and admin name are required' });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid personnel ID' });
  }

  try {
    const person = await Personnel.findById(id);
    if (!person) {
      return res.status(404).json({ message: 'Personnel not found' });
    }

    // Add the note to the personnel record
    person.notes.push({ text, admin, date: new Date() });
    await person.save();

    res.status(201).json({ message: 'Note added successfully', notes: person.notes });
  } catch (error) {
    res.status(500).json({ message: 'Error adding note', error });
  }
});

// API для получения комментариев о персонале
app.get('/personnel/:id/notes', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid personnel ID' });
  }

  try {
    const person = await Personnel.findById(id);
    if (!person) {
      return res.status(404).json({ message: 'Personnel not found' });
    }
    res.status(200).json(person.notes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notes', error });
  }
});

// API для добавления комментариев
app.post('/personnel/:id/notes', async (req, res) => {
  const { id } = req.params;
  const { text, admin } = req.body;

  if (!text || !admin) {
    return res.status(400).json({ message: 'Text and admin name are required' });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid personnel ID' });
  }

  try {
    const person = await Personnel.findById(id);
    if (!person) {
      return res.status(404).json({ message: 'Personnel not found' });
    }

    // Добавление комментария
    person.notes.push({ text, admin, date: new Date() });
    await person.save();

    res.status(201).json({ message: 'Note added successfully', notes: person.notes });
  } catch (error) {
    res.status(500).json({ message: 'Error adding note', error });
  }
});

// Получить список пользователей
app.get('/admin/users', async (req, res) => {
  const users = await db.collection('users').find().toArray();
  res.json(users);
});

// Создать нового пользователя
app.post('/admin/users', async (req, res) => {
  const { username, password } = req.body;
  await db.collection('users').insertOne({ username, password });
  res.status(201).send({ message: 'User created' });
});

// Обновить пользователя
app.put('/admin/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;
  await db.collection('users').updateOne({ _id: new ObjectId(id) }, { $set: { username, password } });
  res.send({ message: 'User updated' });
});

// Удалить пользователя
app.delete('/admin/users/:id', async (req, res) => {
  const { id } = req.params;
  await db.collection('users').deleteOne({ _id: new ObjectId(id) });
  res.send({ message: 'User deleted' });
});
// Получение всех пользователей
app.get('/admin/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Исключаем пароли из ответа
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

// Добавление нового пользователя
app.post('/admin/users', async (req, res) => {
  const { nickname, password } = req.body;

  if (!nickname || !password) {
    return res.status(400).json({ message: 'Nickname and password are required' });
  }

  try {
    const user = new User({ nickname, password });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err.message });
  }
});

// Редактирование пользователя
app.put('/admin/users/:id', async (req, res) => {
  const { id } = req.params;
  const { nickname, password } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { nickname, password },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Error updating user', error: err.message });
  }
});

// Удаление пользователя
app.delete('/admin/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
});


// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});




