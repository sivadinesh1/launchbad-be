const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const uploadController = require('../../controllers/upload.controller');

router.route('/add/:position').post(auth('getUsers'), uploadController.uploadLogo);

module.exports = router;
