const express = require('express');
const stockRouter = express.Router();
const { auth } = require('../../middleware/auth');

const stockController = require('../../controllers/stock.controller');
stockRouter
	.route('/search-all-draft-purchase')
	.get(auth('getUsers'), stockController.searchAllDraftPurchase);

stockRouter
	.route('/search-purchase')
	.post(auth('getUsers'), stockController.searchPurchase);
stockRouter
	.route('/search-sales')
	.post(auth('getUsers'), stockController.searchSales);

stockRouter
	.route('/purchase-master/:id')
	.get(auth('getUsers'), stockController.purchaseMaster);
stockRouter
	.route('/sales-master/:id')
	.get(auth('getUsers'), stockController.getSalesMaster);

stockRouter
	.route('/sale-details/:id')
	.get(auth('getUsers'), stockController.getSalesDetails);

stockRouter
	.route('/delete-sale-details')
	.post(auth('getUsers'), stockController.deleteSaleDetails);

stockRouter
	.route('/delete-item-history/:sale_id')
	.get(auth('getUsers'), stockController.deleteItemHistory);

stockRouter
	.route('/purchase-details/:id')
	.get(auth('getUsers'), stockController.purchaseDetails);

stockRouter
	.route('/delete-purchase-details')
	.post(auth('getUsers'), stockController.deletePurchaseDetails);

stockRouter
	.route('/delete-purchase/:id')
	.delete(auth('getUsers'), stockController.deletePurchaseById);

stockRouter
	.route('/delete-purchase-master/:id')
	.delete(auth('getUsers'), stockController.deletePurchaseMasterById);

stockRouter
	.route('/all-products-with-mrp/:product_id')
	.get(auth('getUsers'), stockController.getProductWithAllMRP);

stockRouter
	.route('/delete-product-from-stock/:product_id/:mrp/:is_active')
	.delete(auth('getUsers'), stockController.deleteProductFromStock);

stockRouter
	.route('/stock-correction')
	.post(auth('getUsers'), stockController.stockCorrection);

module.exports = stockRouter;
