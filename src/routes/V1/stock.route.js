const express = require('express');
const stockRouter = express.Router();

const stockController = require('../../controllers/stock.controller');
stockRouter.route('/search-all-draft-purchase/:centerid').get(stockController.searchAllDraftPurchase);

stockRouter.route('/search-purchase').post(stockController.searchPurchase);
stockRouter.route('/search-sales').post(stockController.searchSales);

stockRouter.route('/purchase-master/:id').get(stockController.purchaseMaster);
stockRouter.route('/purchase-master/:id').get(stockController.getSalesMaster);

stockRouter.route('/sale-details/:id').get(stockController.getSalesDetails);

stockRouter.route('/delete-sale-details').post(stockController.deleteSaleDetails);

stockRouter.route('/delete-item-history/:saleid').get(stockController.deleteItemHistory);

stockRouter.route('/purchase-details/:id').get(stockController.purchaseDetails);

stockRouter.route('/delete-purchase-details').post(stockController.deletePurchaseDetails);

stockRouter.route('/delete-purchase/:id').delete(stockController.deletePurchaseById);

stockRouter.route('/delete-purchase-master/:id').delete(stockController.deletePurchaseMasterById);

stockRouter.route('/all-products-with-mrp/:productid').get(stockController.getProductWithAllMRP);

stockRouter.route('/delete-product-from-stock/:productid/:mrp/:centerid').get(stockController.deleteProductFromStock);

stockRouter.route('/stock-correction').post(stockController.stockCorrection);

module.exports = stockRouter;
