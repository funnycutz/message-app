const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Simuler une base de données avec un fichier JSON
const dbFilePath = './data.json';

// Lire le fichier JSON
const readDatabase = () => {
  try {
    return JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
  } catch (e) {
    return { users: [], messages: [] };
  }
};

// Sauvegarder les données dans le fichier
const saveDatabase = (data) => {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
};

// Créer un nouvel utilisateur
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const db = readDatabase();
  
  if (db.users.find(user => user.username === username)) {
    return res.status(400).send('Username already exists');
  }
  
  db.users.push({ username, password, messages: [] });
  saveDatabase(db);
  res.status(200).send('User registered');
});

// Se connecter avec un utilisateur existant
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDatabase();
  
  const user = db.users.find(u => u.username === username && u.password === password);
  if (user) {
    return res.status(200).send('Logged in');
  } else {
    return res.status(401).send('Invalid username or password');
  }
});

// Envoyer un message privé
app.post('/send-message', (req, res) => {
  const { fromUser, toUser, message } = req.body;
  const db = readDatabase();
  
  const sender = db.users.find(u => u.username === fromUser);
  const receiver = db.users.find(u => u.username === toUser);
  
  if (!sender || !receiver) {
    return res.status(404).send('User not found');
  }
  
  const msg = { from: fromUser, to: toUser, message };
  db.messages.push(msg);
  sender.messages.push(msg);
  receiver.messages.push(msg);
  saveDatabase(db);
  
  res.status(200).send('Message sent');
});

// Obtenir les messages d'un utilisateur spécifique
app.get('/get-messages/:username', (req, res) => {
  const { username } = req.params;
  const db = readDatabase();
  
  const user = db.users.find(u => u.username === username);
  if (user) {
    res.status(200).json(user.messages);
  } else {
    res.status(404).send('User not found');
  }
});

// Lancer le serveur sur le port 3000
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
