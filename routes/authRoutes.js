// routes/authRoutes.js
const express = require('express');
const { register } = require('../controllers/registerController');
const { login } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

module.exports = router;
