import express from 'express';
import sequelize from './sequelize'; // Import the Sequelize instance
import { Confession } from './models/Confession';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Sync the database
sequelize.sync().then(() => {
  console.log('Database synced');
});

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.post('/confess', async (req, res) => {
  const { confession } = req.body;
  if (confession) {
    await Confession.create({ text: confession });
  }
  res.redirect('/confessions');
});

app.get('/confessions', async (req, res) => {
  const confessions = await Confession.findAll();
  res.render('confessions', { confessions });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
