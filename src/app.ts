import express from 'express';
import sequelize from './sequelize'; // Import the Sequelize instance
import { Confession } from './models/Confession';
import path from 'path';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
dotenv.config();

const ADMIN_PATH = process.env.ADMIN_PATH || 'admin';

const voteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 15, // Limit each IP to 15 requests per windowMs
  message: 'Too many requests, please try again later.'
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.set('case sensitive routing', true);
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

app.get(`/${ADMIN_PATH}`, async (req, res) => {
  const confessions = await Confession.findAll();
  res.render('admin', { confessions, ADMIN_PATH });
});

// Route to serve the edit form
app.get(`/${ADMIN_PATH}/edit/:id`, async (req, res) => {
  const confession = await Confession.findByPk(req.params.id);
  if (!confession) {
      res.status(404).send('Confession not found');
      return;
  }
  res.render('edit', { confession, ADMIN_PATH });
});


// Route to handle updates
app.post(`/${ADMIN_PATH}/update`, async (req, res) => {
    const { id, text, score, archived, ipAddress, userAgent } = req.body;
    const confession = await Confession.findByPk(id);

    if (confession) {
        confession.text = text || confession.text;
        confession.score = score || confession.score;
        confession.archived = archived === 'on';
        confession.ipAddress = ipAddress || confession.ipAddress;
        confession.userAgent = userAgent || confession.userAgent;
        await confession.save();
        res.redirect(`/${ADMIN_PATH}`);
    } else {
        res.status(404).send('Confession not found');
    }
});

app.post(`/${ADMIN_PATH}/delete/:id`, async (req, res) => {
  const confession = await Confession.findByPk(req.params.id);
  
  if (confession) {
      await confession.destroy();
      res.redirect(`/${ADMIN_PATH}`);
  } else {
      res.status(404).send('Confession not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});