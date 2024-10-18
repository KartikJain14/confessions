import express from 'express';
import sequelize from './sequelize';
import { Confession } from './models/Confession';
import path from 'path';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
dotenv.config();

const ADMIN_PATH = process.env.ADMIN_PATH || 'admin';

// Rate limiter for voting
const voteLimiter = rateLimit({
  windowMs: (parseInt(process.env.VOTE_WINDOW || '1', 10) * 60 * 60 * 1000),
  max: parseInt(process.env.VOTE_LIMIT || '15', 10),
  message: 'Too many requests, please try again later.'
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware and Setup
app.use(cors()); // Enable CORS
app.set('case sensitive routing', true); // Case sensitivity for routes
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files
app.set('view engine', 'ejs'); // Set EJS as the view engine
app.set('views', path.join(__dirname, 'views')); // Set the views directory
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack); // Log errors to the console
  res.status(500).send('Something went wrong!'); // Send a 500 error response
});

// Sync database and log status
sequelize.sync().then(() => {
  console.log('Database synced');
});

// GET Routes
// Render the homepage
app.get('/', (req, res) => {
  res.render('index');
});

// Render a list of confessions, sorted based on query parameter
app.get('/confessions', async (req, res) => {
  const { sort } = req.query;
  const confessions = await Confession.findAll({
    order: sort === 'vote' ? [['score', 'DESC']] : [['createdAt', 'DESC']],
    where: { archived: false }
  });
  res.render('confessions', { confessions });
});

// Render an individual confession based on ID
app.get('/confession/:id', async (req, res) => {
  const confession = await Confession.findByPk(req.params.id);
  if (!confession || confession?.archived) {
    res.send('Confession was not found'); // Handle not found
  } else {
    res.render('confession', { confession });
  }
});

// Render the admin panel with all confessions
app.get(`/${ADMIN_PATH}`, async (req, res) => {
  const confessions = await Confession.findAll();
  res.render('admin', { confessions, ADMIN_PATH });
});

// Render the edit form for a specific confession
app.get(`/${ADMIN_PATH}/edit/:id`, async (req, res) => {
  const confession = await Confession.findByPk(req.params.id);
  if (!confession) {
    res.status(404).send('Confession not found'); // Handle not found
    return;
  }
  res.render('edit', { confession, ADMIN_PATH });
});

// POST Routes
// Handle confession creation
app.post('/confess', voteLimiter, async (req, res) => {
  const { confession } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress; // Get IP address
  const userAgent = req.headers['user-agent']; // Get user agent

  if (confession.length < 10 || confession.length > 255) {
    res.send('Confession length should be between 10 and 255!'); // Validate length
  } else {
    if (confession) {
      await Confession.create({
        text: confession,
        ipAddress: ipAddress,
        userAgent: userAgent,
      });
    }
    res.redirect('/confessions'); // Redirect after creating confession
  }
});

// Handle voting on a confession (upvote or downvote)
app.post('/confess/vote/:id/:vote', voteLimiter, async (req, res) => {
  const { vote } = req.params;
  const { id } = req.params;

  if (vote !== '1' && vote !== '-1') {
    res.status(400).send('Invalid input: vote must be 1 (upvote) or -1 (downvote)'); // Validate vote input
    return;
  }

  const voteValue = parseInt(vote, 10);
  
  try {
    if (voteValue === -1) {
      await Confession.decrement({ score: 1 }, { where: { id } }); // Downvote
    } else {
      await Confession.increment({ score: 1 }, { where: { id } }); // Upvote
    }
    res.status(200).send('Vote Successful'); // Confirm success
  } catch (error) {
    res.status(500).send(error); // Handle server error
  }
});

// Handle updates to a confession
app.post(`/${ADMIN_PATH}/update`, async (req, res) => {
  const { id, text, score, archived, ipAddress, userAgent } = req.body;
  const confession = await Confession.findByPk(id);

  if (confession) {
    confession.text = text || confession.text;
    confession.score = score || confession.score;
    confession.archived = archived === 'on';
    confession.ipAddress = ipAddress || confession.ipAddress;
    confession.userAgent = userAgent || confession.userAgent;
    await confession.save(); // Save updated confession
    res.redirect(`/${ADMIN_PATH}`); // Redirect to admin panel
  } else {
    res.status(404).send('Confession not found'); // Handle not found
  }
});

// Handle deletion of a confession
app.post(`/${ADMIN_PATH}/delete/:id`, async (req, res) => {
  const confession = await Confession.findByPk(req.params.id);
  
  if (confession) {
    await confession.destroy(); // Delete confession
    res.redirect(`/${ADMIN_PATH}`); // Redirect to admin panel
  } else {
    res.status(404).send('Confession not found'); // Handle not found
  }
});

// Utility Functions
// Purge confessions that have a low score
async function purgeConfessions() {
  const confessions = await Confession.findAll({
    order: [['score', 'DESC']],
    where: { archived: false }
  });

  for (const confession of confessions) {
    if (confession.score <= -10) {
      await Confession.update({ archived: true }, { where: { id: confession.id } }); // Archive confessions with low score
    }
  }
}

// Set interval for purging confessions
setInterval(purgeConfessions, 1000 * 60 * 60); // Purge confessions every hour

// Start the server and log the status
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
