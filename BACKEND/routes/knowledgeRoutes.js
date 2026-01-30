const express = require('express');
const router = express.Router();
const knowledgeController = require('../controllers/knowledgeController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', knowledgeController.getAllKnowledge);
router.get('/:id', knowledgeController.getKnowledge);
router.get('/search/faq', knowledgeController.searchFAQ);

// Protected routes (for platform admin to add content)
router.post('/', auth, knowledgeController.createKnowledge);
router.put('/:id', auth, knowledgeController.updateKnowledge);

module.exports = router;