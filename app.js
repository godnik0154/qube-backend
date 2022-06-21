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
const verifyMember = require('./routes/verifycredentials')
app.use(morgan('dev'));

const corsOptions = { 
  origin:'*',
  credentials:true,
  optionSuccessStatus: 200
}

app.use(cors(corsOptions));
app.use(express.json({
  limit: '50mb',
  type: ['application/json', 'text/plain'],
}));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: false }));

app.get('/',(req,res,next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); 
  res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS"); 
  if (req.method == "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
})

app.use('/signup', signup);
app.use('/onboarding', onboarding);
app.use('/profile',profile);
app.use('/login', login);
app.use('/verify',verifyMember)

const port = process.env.PORT || 9000;
mongoConnect(async () => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});