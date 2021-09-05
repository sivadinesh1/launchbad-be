const express = require('express');
const router = express.Router();

const reportsController = require('../../controllers/reports.controller');

router.route('/full-inventory-report').post(reportsController.fullStockReport);

router.route('/inventory-report').post(reportsController.getProductInventoryReport);
router.route('/inventory-report-short').post(reportsController.getProductInventoryReportShort);
router.route('/product-summary-report').post(reportsController.getProductSummaryReport);
router.route('/customer-statement').post(reportsController.getStatement);

router.route('/vendor-statement').post(reportsController.getVendorStatement);

router.route('/customer-closing-balance-statement').post(reportsController.getReceivablesClosingBalance);

router.route('/customer-opening-balance-statement').post(reportsController.getReceivablesOpeningBalance);

router.route('/item-wise-sale').post(reportsController.getItemWiseSale);

module.exports = router;
