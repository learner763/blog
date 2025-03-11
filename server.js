import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersFilePath = path.join(__dirname, 'users.json');
const signedInUsersFilePath = path.join(__dirname, 'signedInUsers.json');

// Helper function to read signed-in users from file
const readSignedInUsers = () => {
  if (fs.existsSync(signedInUsersFilePath)) {
    let data = fs.readFileSync(signedInUsersFilePath, 'utf8');
    return new Set(JSON.parse(data));
  }
  return new Set();
};

// Helper function to write signed-in users to file
const writeSignedInUsers = (signedInUsers) => {
  fs.writeFileSync(signedInUsersFilePath, JSON.stringify(Array.from(signedInUsers), null, 2));
};

let signedInUsers = readSignedInUsers();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));


// Serve the login page

app.get('/Info', (req, res) => {
  res.sendFile(path.join(__dirname,  'Info.html'));
});
app.get('/Profile', (req, res) => {
  res.sendFile(path.join(__dirname,  'Profile.html'));
});
app.get('/Settings', (req, res) => {
  res.sendFile(path.join(__dirname,  'Settings.html'));
});

app.get('/Logout', (req, res) => {
  res.sendFile(path.join(__dirname,  'Logout.html'));
});
app.get('/Home', (req, res) => {
  res.sendFile(path.join(__dirname,  'Home.html'));
});
app.get('/Library', (req, res) => {
  res.sendFile(path.join(__dirname,  'Library.html'));
});
app.get('/Stories', (req, res) => {
  res.sendFile(path.join(__dirname,  'Stories.html'));
});
app.get('/Write', (req, res) => {
  res.sendFile(path.join(__dirname,  'Write.html'));
});
app.get('/Search', (req, res) => {
  res.sendFile(path.join(__dirname,  'Search.html'));
})
app.get('/People', (req, res) => {
  res.sendFile(path.join(__dirname,  'People.html'));
})
;app.get('/Notify', (req, res) => {
  res.sendFile(path.join(__dirname,  'Notify.html'));
})

// Handle login requests
app.post('/index', (req, res) => {
  const { overall_data } = req.body;
  // Simulate a simple authentication process
  {
    let user=overall_data.Username
    let c=0
    signedInUsers=Array.from(signedInUsers)
    for(let i=0;i<signedInUsers.length;i++)
    {
      if(signedInUsers[i][0].Username==user )
      {
        c=1
      }
    }
    if(c==0){
      signedInUsers.push([overall_data]);
    }
    signedInUsers=new Set(signedInUsers);
    writeSignedInUsers(signedInUsers); 
    res.json({ success: true });
  }
});

app.post('/Info', (req, res) => {
  let  { overall_data,username,password } = req.body;

  // Simulate a simple authentication process
  {
    signedInUsers=Array.from(signedInUsers)

    for(let i=0;i<signedInUsers.length;i++)
    {
      if(signedInUsers[i][0].Username==username)
      {
        signedInUsers[i][1]=overall_data
      }
    }
    signedInUsers=new Set(signedInUsers);
    writeSignedInUsers(signedInUsers); // Save the updated list to the file
    res.json({ success: true });
  }
});
// Get all signed-in users
app.get('/signed-in-users', (req, res) => {
  res.json(Array.from(signedInUsers));
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,  'index.html'));
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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
