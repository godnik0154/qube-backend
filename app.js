require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express();
const morgan = require('morgan');
const port = 1212;
const { mongoConnect } = require('./util/database');
const signup = require('./routes/signup');
const login = require('./routes/login');
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
  res.status(200).json({
    data: "Site is working"
  })
})

app.use('/signup', signup);
app.use('/login', login);

mongoConnect(async () => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
