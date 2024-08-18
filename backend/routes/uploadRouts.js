const express = require('express');
const { upload, uploadFiles } = require('../controllers/uploadController');
const router = express.Router();

router.post('/upload', upload.array('files'), uploadFiles);

module.exports = router;
