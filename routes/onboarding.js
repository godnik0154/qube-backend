const express = require('express');
const router = express.Router();

const {
    addData,
    getAllBrands
} = require('../controllers/onboarding')

router.post('/',addData);
router.get('/brands',getAllBrands);

module.exports = router;