const express = require('express');
const { execute } = require('../functions/compileRun');

const router = express.Router();

router.post('/compile', execute);

module.exports = router;
