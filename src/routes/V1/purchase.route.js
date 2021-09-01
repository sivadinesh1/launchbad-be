const express = require('express');
const router = express.Router();

const purchaseController = require('../../controllers/purchase.controller');

router.route('/insert-purchase-details').post(purchaseController.insertPurchaseDetails);

module.exports = router;
