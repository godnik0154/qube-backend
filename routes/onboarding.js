const express = require('express');
const router = express.Router();

const {
    addData,
    getAllBrands,
    updateImage
} = require('../controllers/onboarding')

router.post('/',addData);
router.get('/brands',getAllBrands);
router.post('/updateProfileImage',updateImage)

module.exports = router;