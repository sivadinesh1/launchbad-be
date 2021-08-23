const express = require('express');
const router = express.Router();

const accountsController = require('../../controllers/accounts.controller');

router.route('/add-payment-received').post(accountsController.addPaymentReceived);

router.route('/get-ledger-customer/:centerid/:customerid').get(accountsController.getLedgerByCustomers);

router.route('/get-sale-invoice-customer').post(accountsController.getSaleInvoiceByCustomers);

router.route('/get-sale-invoice-center').post(accountsController.getSaleInvoiceByCenter);

router.route('/get-payments-customer').post(accountsController.getPaymentsByCustomers);

router.route('/get-payments-overview-customer').post(accountsController.getPaymentsOverviewByCustomers);

router.route('/get-pymt-transactions-customer/:centerid/:customerid').get(accountsController.getPymtTransactionByCustomers);

router.route('/get-payments-center').post(accountsController.getPaymentsByCenter);

router.route('/get-payments-overview-center').post(accountsController.getPaymentsOverviewByCenter);

router.route('/get-pymt-transactions-center/:centerid').get(accountsController.getPymtTransactionsByCenter);

router.route('/add-bulk-payment-received').get(accountsController.addBulkPaymentReceived);

router.route('/banks-list/:centerid').get(accountsController.bankList);

router.route('/pymt-bank-ref-exist').get(accountsController.isPaymentBankRef);

router.route('/vendor-pymt-bank-ref-exist').get(accountsController.vendorPaymentBankRef);

module.exports = router;
