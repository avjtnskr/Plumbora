const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  register, login, getMe, updateMe, changePassword, deleteMe,
} = require('../controllers/auth.controller');

// Public
router.post('/register', register);
router.post('/login',    login);

// Protected
router.get('/me',       protect, getMe);
router.put('/me',       protect, updateMe);
router.put('/password', protect, changePassword);
router.delete('/me',    protect, deleteMe);

module.exports = router;
