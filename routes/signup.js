const express = require('express');
const { addUser } = require('../controllers/signup');
const router = express.Router();

router.post('/', addUser);

module.exports = router;