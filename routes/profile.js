const express = require('express');
const router = express.Router();

const {
    getImage,
    getProfile
} = require('../controllers/profile')

router.get('/getImage/:name',getImage);
router.get('/:name',getProfile)

module.exports = router;