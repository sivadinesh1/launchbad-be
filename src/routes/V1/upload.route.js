const express = require('express');
const router = express.Router();

const uploadController = require('../../controllers/upload.controller');

router.route('/add/:centerid/:position').post(uploadController.uploadLogo);

module.exports = router;
