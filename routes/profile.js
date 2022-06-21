const express = require('express');
const router = express.Router();

const {
    getImage,
    getProfile,
    changePassword,
    changeGenral
} = require('../controllers/profile')

router.get('/getImage/:name',getImage);
router.get('/:name',getProfile)
router.post('/password',changePassword);
router.post('/general',changeGenral)

module.exports = router;