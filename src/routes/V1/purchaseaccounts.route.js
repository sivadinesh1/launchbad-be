const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');

const purchaseAccountsController = require('../../controllers/purchaseaccounts.controller');

router.route('/get-purchase-invoice-center').post(auth('getUsers'), purchaseAccountsController.getPurchaseInvoiceByCenter);

router.route('/add-vendor-payment-received').post(auth('getUsers'), purchaseAccountsController.addVendorPaymentReceived);

router.route('/add-bulk-vendor-payment-received').post(auth('getUsers'), purchaseAccountsController.addBulkVendorPaymentReceived);

router.route('/get-vendor-payments-center').post(auth('getUsers'), purchaseAccountsController.getVendorPaymentsByCenter);

router.route('/get-purchase-invoice-vendor').post(auth('getUsers'), purchaseAccountsController.getPurchaseInvoiceByVendors);

router.route('/get-payments-vendor').post(auth('getUsers'), purchaseAccountsController.getPaymentsByVendors);

router.route('/get-ledger-vendor/:vendorid').get(auth('getUsers'), purchaseAccountsController.getLedgerByVendors);

router.route('/get-ledger-vendor/:vendorid').get(auth('getUsers'), purchaseAccountsController.getLedgerByVendors);

module.exports = router;
