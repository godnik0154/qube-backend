const express = require('express');
const router = express.Router();

const {
    addData
} = require('../controllers/onboarding')

router.post('/',addData);

module.exports = router;