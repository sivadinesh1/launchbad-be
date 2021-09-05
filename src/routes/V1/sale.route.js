const express = require('express');
const router = express.Router();

const salesController = require('../../controllers/sales.controller');

// Get Possible Next Sale Invoice # (ReadOnly)
router.route('/get-next-sale-invoice-no/:centerid/:invoicetype').get(salesController.getNextSaleInvoiceNoAsync);

router.route('/delete-sales-details').post(salesController.deleteSalesDetails);

router.route('/insert-sale-details').post(salesController.insertSaleDetails);

router.route('/convert-sale').post(salesController.convertSale);

router.route('/delete-sale/:id').get(salesController.deleteSale);

router.route('/delete-sale-master/:id').get(salesController.deleteSaleMaster);

router.route('/get-sale-master/:sale_id').get(salesController.getSaleMaster);

router.route('/get-sale-details/:sale_id').get(salesController.getSalesDetails);

router.route('/update-get-print-counter/:sale_id').get(salesController.updateGetPrintCounter);

router.route('/get-print-counter/:sale_id').get(salesController.getPrintCounter);

router.route('/duplicate-invoiceno-check').get(salesController.duplicateInvoiceNoCheck);

module.exports = router;
