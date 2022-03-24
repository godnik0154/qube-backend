const express = require('express');
const router = express.Router();

const {
    getImage
} = require('../controllers/profile')

router.get('/getImage/:name',getImage);

module.exports = router;