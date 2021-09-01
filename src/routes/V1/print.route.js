const express = require('express');
const router = express.Router();

const printController = require('../../controllers/print.controller');

router.route('/invoice-pdf').post(printController.invoicePDF);
router.route('/estimate-pdf').post(printController.estimatePDF);
router.route('/credit-note-pd').post(printController.creditNotePDF);

module.exports = router;
