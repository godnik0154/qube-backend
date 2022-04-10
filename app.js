require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express();
const morgan = require('morgan');
const { mongoConnect } = require('./util/database');
const signup = require('./routes/signup');
const login = require('./routes/login');
const onboarding = require('./routes/onboarding');
const profile = require('./routes/profile');
app.use(morgan('dev'));
app.use(cors());

app.use(
  express.json({
    limit: '50mb',
    type: ['application/json', 'text/plain'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: false }));

app.get('/',(req,res) => {
  return res.status(200).json({
    data: "Site is working at new Node"
  })
})

app.use('/signup', signup);
app.use('/onboarding', onboarding);
app.use('/profile',profile)
app.use('/login', login);

const port = process.env.PORT || 9000;
mongoConnect(async () => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
