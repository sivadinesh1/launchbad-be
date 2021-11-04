const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');

const purchaseController = require('../../controllers/purchase.controller');

router.route('/insert-purchase-details').post(auth('getUsers'), purchaseController.insertPurchase);

module.exports = router;
