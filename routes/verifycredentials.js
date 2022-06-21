const express = require('express');
const { sendOtpViaMail,verifyPassword,verifyOtpViaMail,sentOtpViaSMS } = require('../controllers/verifycredentials');
const router = express.Router();

router.post('/mail/sent', sendOtpViaMail);
router.post('/mail', verifyOtpViaMail);

router.post('/sms/sent',sentOtpViaSMS);
router.post('/password',verifyPassword);
module.exports = router;