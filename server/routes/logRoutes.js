const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

router.post('/bulk', logController.bulkUploadLogs);
router.get('/', logController.getLogs);

module.exports = router;
