const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ثبت‌نام: انتظار دریافت email، password و fullName
router.post('/signup', authController.signUp);

// ورود: انتظار دریافت email و password
router.post('/login', authController.login);

// کال‌بک مربوط به OAuth Google
router.get('/google/callback', authController.googleCallback);

// کال‌بک مربوط به OAuth LinkedIn
router.get('/linkedin', authController.linkedinAuth);

module.exports = router;