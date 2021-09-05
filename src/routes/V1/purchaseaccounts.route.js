const express = require('express');
const router = express.Router();

const purchaseAccountsController = require('../../controllers/purchaseaccounts.controller');

router.route('/get-purchase-invoice-center').post(purchaseAccountsController.getPurchaseInvoiceByCenter);

router.route('/add-vendor-payment-received').post(purchaseAccountsController.addVendorPaymentReceived);

router.route('/add-bulk-vendor-payment-received').post(purchaseAccountsController.addBulkVendorPaymentReceived);

router.route('/get-vendor-payments-center').post(purchaseAccountsController.getVendorPaymentsByCenter);

router.route('/get-purchase-invoice-vendor').post(purchaseAccountsController.getPurchaseInvoiceByVendors);

router.route('/get-payments-vendor').post(purchaseAccountsController.getPaymentsByVendors);

router.route('/get-ledger-vendor/:centerid/:vendorid').get(purchaseAccountsController.getLedgerByVendors);

router.route('/get-ledger-vendor/:centerid/:vendorid').get(purchaseAccountsController.getLedgerByVendors);

module.exports = router;
