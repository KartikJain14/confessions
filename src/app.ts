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

  // Capture IP address and user agent
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];

  if (confession) {
    await Confession.create({
      text: confession,
      ipAddress: ipAddress,
      userAgent: userAgent,
    });
  }
  res.redirect('/confessions');
});

app.get('/confessions', async (req, res) => {
  const confessions = await Confession.findAll({
    order: [['createdAt', 'DESC']],
  });
  res.render('confessions', { confessions });
});

app.post('/confess/update/:id', async (req, res) => {
  const { confession } = req.body;
  const confessionId = req.params.id;

  try {
    await Confession.update(
      { text: confession },
      { where: { id: confessionId } }
    );
    res.redirect('/confessions');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
