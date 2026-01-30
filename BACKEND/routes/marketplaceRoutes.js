const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');
const auth = require('../middleware/auth');
const upload = require('../config/multer');

// Public routes
router.get('/', marketplaceController.getAllItems);
router.get('/:id', marketplaceController.getItem);

// Protected routes
router.post('/', auth, upload.array('itemImage', 5), marketplaceController.createItem);
router.get('/user/my-items', auth, marketplaceController.getMyItems);
router.put('/:id', auth, upload.array('itemImage', 5), marketplaceController.updateItem);
router.delete('/:id', auth, marketplaceController.deleteItem);

module.exports = router;