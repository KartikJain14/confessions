import express from 'express';
import sequelize from './sequelize'; // Import the Sequelize instance
import { Confession } from './models/Confession';
import path from 'path';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
dotenv.config();

const voteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 15, // Limit each IP to 15 requests per windowMs
  message: 'Too many requests, please try again later.'
});

const basicAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const auth = req.headers.authorization;

  if (!auth) {
      res.status(401).set('WWW-Authenticate', 'Basic').send('Authentication required.');
  } else {
      const [username, password] = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');

      if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
          next(); // Proceed to the next middleware or route handler
      } else {
          res.status(403).send('Forbidden');
      }
  }
};

const app = express();
app.set('trust proxy', true);
const PORT = process.env.PORT || 3000;

// Middleware
app.use('/admin', basicAuth);
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Sync the database
sequelize.sync().then(() => {
  console.log('Database synced');
});

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.post('/confess', voteLimiter, async (req, res) => {
  const { confession } = req.body;
  // Capture IP address and user agent
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  if(confession.length < 10 || confession.length > 255){
    res.send('Confession length should be between 10 and 255!');
  }
  else{

  if (confession) {
    await Confession.create({
      text: confession,
      ipAddress: ipAddress,
      userAgent: userAgent,
    });
  }
  res.redirect('/confessions');
}});

app.get('/confessions', async (req, res) => {
  const { sort } = req.query;
  if (sort === 'vote') {
    const confessions = await Confession.findAll({
      order: [['score', 'DESC']],
      where: {
        archived: false
      }
    });
    res.render('confessions', { confessions });
  }else{
    const confessions = await Confession.findAll({
      order: [['createdAt', 'DESC']],
      where: {
        archived: false
      }
    });
    res.render('confessions', { confessions });
  }
});

app.post('/confess/vote/:id/:vote', voteLimiter, async (req, res) => {
  const { vote } = req.params; // Expecting a number
  const { id } = req.params;

  // Validate the vote input
  if (vote !== '1' && vote !== '-1') {
    res.status(400).send('Invalid input: vote must be 1 (upvote) or -1 (downvote)');
    return;
  }

  const voteValue = parseInt(vote, 10); // Convert to integer
  try {
    if (voteValue === -1) {
      await Confession.decrement({ score: 1 }, { where: { id } }); // Upvote
    } else {
      await Confession.increment({ score: 1 }, { where: { id } }); // Downvote
    }
    res.status(200).send('Vote Successful');
  } catch (error) {
    res.status(500).send(error);
  }
});


// app.post('/confess/update', async (req, res) => {
//   const { id, text, score, archived, password } = req.body;
//   if(password != KEY){
//     res.status(401).send('Unauthorized');
//     return;
//   }

//   try {
//       // Find the confession by ID
//       const confession = await Confession.findByPk(id);
//       if (!confession) {
//           res.status(404).send('Confession not found');
//           return;
//       }
//       // Update confession fields only if they are provided
//       if (text) {
//           confession.text = text;
//       }
//       if (score !== undefined && score != '') {
//           confession.score = score; // Ensure score is provided
//       }
//       if (archived !== undefined) {
//         confession.archived = true; // Convert checkbox to boolean
//       }
//       else{
//         confession.archived = false;
//       }
//       // Save the updated confession
//       await confession.save();

//       // Redirect or respond with a success message
//       res.redirect('/confessions'); // Change to your desired redirect path
//   } catch (error) {
//       console.error(error);
//       res.status(500).send('Error updating confession');
//   }
// });


app.get('/confession/:id', async (req, res) => {
  //Yet to make a good frontend for this
  const confession = await Confession.findByPk(req.params.id);
  if(confession?.archived){
    res.send('Confession has been deleted');
  }else{
  res.render('confession', { confession });
}});

async function purgeConfessions() {
  const confessions = await Confession.findAll({
    order: [['score', 'DESC']],
    where: {
      archived: false
    }
  });

  for (const confession of confessions) {
    if (confession.score <= -10) {
      await Confession.update({ archived: true }, { where: { id: confession.id } });
    }
  }
}

setInterval(purgeConfessions, 1000 * 60 * 60); // Purge confessions every hour

// Admin route to view all confessions
app.get('/admin', async (req, res) => {
  const confessions = await Confession.findAll();
  res.send(`
      <h1>Admin Portal</h1>
      <table>
          <tr>
              <th>ID</th>
              <th>Text</th>
              <th>Score</th>
              <th>Archived</th>
              <th>Actions</th>
          </tr>
          ${confessions.map(confession => `
              <tr>
                  <td>${confession.id}</td>
                  <td>${confession.text}</td>
                  <td>${confession.score}</td>
                  <td>${confession.archived}</td>
                  <td>
                      <form action="/admin/edit/${confession.id}" method="GET" style="display:inline;">
                          <button type="submit">Edit</button>
                      </form>
                  </td>
              </tr>
          `).join('')}
      </table>
  `);
});

// Route to serve the edit form
app.get('/admin/edit/:id', async (req, res) => {
  const confession = await Confession.findByPk(req.params.id);
  if (!confession) {
    res.status(404).send('Confession not found');
    return;
  }
  res.send(`
      <h1>Edit Confession</h1>
      <form action="/admin/update" method="POST">
          <input type="hidden" name="id" value="${confession.id}">
          <label for="text">Confession Text:</label>
          <input type="text" id="text" name="text" value="${confession.text}" required>
          <label for="score">Score:</label>
          <input type="number" id="score" name="score" value="${confession.score}" min="1" required>
          <label>
              <input type="checkbox" name="archived" ${confession.archived ? 'checked' : ''}>
              Archived
          </label>
          <button type="submit">Update</button>
      </form>
      <a href="/admin">Cancel</a>
  `);
});

// Route to handle updates
app.post('/admin/update', async (req, res) => {
  const { id, text, score, archived } = req.body;
  const confession = await Confession.findByPk(id);

  if (confession) {
      confession.text = text || confession.text;
      confession.score = score || confession.score;
      confession.archived = archived === 'on'; // Convert checkbox to boolean
      await confession.save();
      res.redirect('/admin');
  } else {
      res.status(404).send('Confession not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});