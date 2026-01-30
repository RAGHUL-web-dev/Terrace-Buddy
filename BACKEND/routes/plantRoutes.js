const express = require('express');
const router = express.Router();
const plantController = require('../controllers/plantController');
const auth = require('../middleware/auth');
const upload = require('../config/multer');

router.post('/', auth, upload.array('plantImage', 10), plantController.addPlant);
router.get('/my-plants', auth, plantController.getUserPlants);
router.get('/stats', auth, plantController.getPlantStats);
router.put('/:id', auth, upload.array('plantImage', 10), plantController.updatePlant);
router.post('/:id/notes', auth, plantController.addNote);
router.delete('/:id', auth, plantController.deletePlant);

module.exports = router;