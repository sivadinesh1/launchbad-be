const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const salesController = require('../../controllers/sales.controller');

// Get Possible Next Sale Invoice # (ReadOnly)
router.route('/get-next-sale-invoice-no/:invoice_type').get(auth('getUsers'), salesController.getNextSaleInvoiceNoAsync);

router.route('/delete-sales-details').post(auth('getUsers'), salesController.deleteSalesDetails);

router.route('/insert-sale-details').post(auth('getUsers'), salesController.insertSale);

router.route('/convert-sale').post(auth('getUsers'), salesController.convertSale);

router.route('/delete-sale/:id').get(auth('getUsers'), salesController.deleteSale);

router.route('/delete-sale-master/:id').get(auth('getUsers'), salesController.deleteSaleMaster);

router.route('/get-sale-master/:sale_id').get(auth('getUsers'), salesController.getSalesMaster);

router.route('/get-sale-details/:sale_id').get(auth('getUsers'), salesController.getSalesDetails);

router.route('/update-get-print-counter/:sale_id').get(auth('getUsers'), salesController.updateGetPrintCounter);

router.route('/get-print-counter/:sale_id').get(auth('getUsers'), salesController.getPrintCounter);

router.route('/duplicate-invoiceno-check').get(auth('getUsers'), salesController.duplicateInvoiceNoCheck);

module.exports = router;
