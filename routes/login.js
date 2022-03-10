const express = require('express');
const router = express.Router();

const {
    getUser
} = require('../controllers/login')

router.post('/',getUser);

module.exports = router;