const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/auth.middleware');
const {
  getServices, getService, getAllServices, createService, updateService, deleteService,
} = require('../controllers/service.controller');

router.get('/admin/all', protect, adminOnly, getAllServices);
router.get('/', getServices);
router.get('/:id', getService);

router.post('/', protect, adminOnly, createService);
router.put('/:id', protect, adminOnly, updateService);
router.delete('/:id', protect, adminOnly, deleteService);

module.exports = router;
