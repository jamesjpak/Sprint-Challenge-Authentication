const Users = require('../users/users-model');
const secrets = require('./secrets');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const axios = require('axios');

const { authenticate } = require('../auth/authenticate');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
  // implement user registration
  let user = req.body;

  const hash = bcrypt.hashSync(user.password, 10);

  user.password = hash;

  Users.add(user)
  .then(saved => {

    res.status(201).json({ token });
  })
  .catch(error => {
    res.status(500).json(error.message)
  })
}

function login(req, res) {
  // implement user login
  let { username, password } = req.body;

  Users.findBy({ username })
  .first()
  .then(user => {
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = generateToken(user);

      res.status(200).json({ message: `Welcome ${user.username}!`, token })
    } else {
      res.status(401).json({ message: 'Invalid Credentials' })
    }
  })
  .catch(error => {
    console.log(error)
    res.status(500).json(error);
  })
}

function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
  }

  const options = {
    expiresIn: '8h',
  }

  return jwt.sign(payload, secrets.jwtSecret, options)
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
