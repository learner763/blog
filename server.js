import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersFilePath = path.join(__dirname, 'users.json');
const signedInUsersFilePath = path.join(__dirname, 'signedInUsers.json');

// Read signed-in users
const readSignedInUsers = () => {
  if (fs.existsSync(signedInUsersFilePath)) {
    let data = fs.readFileSync(signedInUsersFilePath, 'utf8');
    return new Set(JSON.parse(data));
  }
  return new Set();
};

// Write signed-in users
const writeSignedInUsers = (signedInUsers) => {
  fs.writeFileSync(signedInUsersFilePath, JSON.stringify(Array.from(signedInUsers), null, 2));
};

let signedInUsers = readSignedInUsers();

app.use(bodyParser.json());
app.use(express.static(__dirname));

// Serve pages
const pages = ['Info', 'Profile', 'Settings', 'Logout', 'Home', 'Library', 'Stories', 'Write', 'Search', 'People', 'Notify'];

pages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(__dirname, `${page}.html`));
  });
});

// Handle login
app.post('/index', (req, res) => {
  const { overall_data } = req.body;
  let user = overall_data.Username;
  let c = 0;
  signedInUsers = Array.from(signedInUsers);

  for (let i = 0; i < signedInUsers.length; i++) {
    if (signedInUsers[i][0].Username === user) {
      c = 1;
    }
  }

  if (c === 0) {
    signedInUsers.push([overall_data]);
  }

  signedInUsers = new Set(signedInUsers);
  writeSignedInUsers(signedInUsers);
  res.json({ success: true });
});

app.post('/Info', (req, res) => {
  let { overall_data, username } = req.body;
  signedInUsers = Array.from(signedInUsers);

  for (let i = 0; i < signedInUsers.length; i++) {
    if (signedInUsers[i][0].Username === username) {
      signedInUsers[i][1] = overall_data;
    }
  }

  signedInUsers = new Set(signedInUsers);
  writeSignedInUsers(signedInUsers);
  res.json({ success: true });
});

// API to get signed-in users
app.get('/signed-in-users', (req, res) => {
  res.json(Array.from(signedInUsers));
});

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle user management
app.get('/users', (req, res) => {
  fs.readFile(usersFilePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading users file');
      return;
    }
    res.json(JSON.parse(data));
  });
});

app.post('/users', (req, res) => {
  const newUser = req.body;
  fs.readFile(usersFilePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading users file');
      return;
    }
    const users = JSON.parse(data);
    users.push(newUser);
    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        res.status(500).send('Error writing to users file');
        return;
      }
      res.status(201).send(newUser);
    });
  });
});

// Export for Vercel (NO `app.listen()`)
export default app;
