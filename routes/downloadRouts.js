const express = require('express');
const download = require('../controllers/downloadController');
const router = express.Router();

router.get('/download', download.downloadFile);

module.exports = router;