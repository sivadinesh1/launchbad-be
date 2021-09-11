const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');

const reportsController = require('../../controllers/reports.controller');

router.route('/full-inventory-report').post(auth('getUsers'), reportsController.fullStockReport);

router.route('/inventory-report').post(auth('getUsers'), reportsController.getProductInventoryReport);
router.route('/inventory-report-short').post(auth('getUsers'), reportsController.getProductInventoryReportShort);
router.route('/product-summary-report').post(auth('getUsers'), reportsController.getProductSummaryReport);
router.route('/customer-statement').post(auth('getUsers'), reportsController.getStatement);

router.route('/vendor-statement').post(auth('getUsers'), reportsController.getVendorStatement);

router.route('/customer-closing-balance-statement').post(auth('getUsers'), reportsController.getReceivablesClosingBalance);

router.route('/customer-opening-balance-statement').post(auth('getUsers'), reportsController.getReceivablesOpeningBalance);

router.route('/item-wise-sale').post(auth('getUsers'), reportsController.getItemWiseSale);

module.exports = router;
