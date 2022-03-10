const bcrypt = require('bcrypt');
const { getDb } = require('../util/database');
const jwt = require('jsonwebtoken');

exports.addUser = async (req, res) => {
  const db = getDb();

  try {
    let { email, password } = req.body;

    const user = await db.collection('users').findOne({ email });

    if (user) {
      return res.status(200).json({
        data: 'User already exist please login',
      });
    }

    const saltRounds = await bcrypt.genSalt(10);

    const pass = await bcrypt.hash(password, saltRounds);

    const data = {
      email,
      password: pass,
    };

    await db.collection('users').insertOne(data);

    let jwtSecretKey = process.env.jwtSecretKey;
  
    const token = jwt.sign(data, jwtSecretKey,{ expiresIn: '24h' });

    data.token = token;

    return res.status(200).json({
      data
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};
