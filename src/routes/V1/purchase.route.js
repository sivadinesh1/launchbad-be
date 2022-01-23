const express = require('express');
const purchaseRouter = express.Router();
const { auth } = require('../../middleware/auth');

const purchaseController = require('../../controllers/purchase.controller');

purchaseRouter
	.route('/insert-purchase-details')
	.post(auth('getUsers'), purchaseController.insertPurchase);

purchaseRouter
	.route('/delete-purchase-details')
	.post(auth('getUsers'), purchaseController.deletePurchaseDetails);

module.exports = purchaseRouter;
