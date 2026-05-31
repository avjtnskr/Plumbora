const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/auth.middleware');
const {
  getPlumbers, getPlumber, getAllTechnicians, createPlumber,
  updatePlumber, deletePlumber, updateAvailability,
} = require('../controllers/plumber.controller');

// Public
router.get('/admin/all', protect, adminOnly, getAllTechnicians);
router.get('/',    getPlumbers);
router.get('/:id', getPlumber);

// Admin only
router.post('/',                        protect, adminOnly, createPlumber);
router.put('/:id',                      protect, adminOnly, updatePlumber);
router.delete('/:id',                   protect, adminOnly, deletePlumber);
router.patch('/:id/availability',       protect, adminOnly, updateAvailability);

module.exports = router;
