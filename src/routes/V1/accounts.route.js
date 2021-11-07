const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');

const accountsController = require('../../controllers/accounts.controller');

router.route('/add-payment-received').post(auth('getUsers'), accountsController.addPaymentReceived);

router.route('/get-ledger-customer/:customer_id').get(auth('getUsers'), accountsController.getLedgerByCustomers);

router.route('/get-sale-invoice-customer').post(auth('getUsers'), accountsController.getSaleInvoiceByCustomers);

router.route('/get-sale-invoice-center').post(auth('getUsers'), accountsController.getSaleInvoiceByCenter);

router.route('/get-payments-customer').post(auth('getUsers'), accountsController.getPaymentsByCustomers);

router.route('/get-payments-overview-customer').post(auth('getUsers'), accountsController.getPaymentsOverviewByCustomers);

router.route('/get-pymt-transactions-customer/:customer_id').get(auth('getUsers'), accountsController.getPymtTransactionByCustomers);

router.route('/get-payments-center').post(auth('getUsers'), accountsController.getPaymentsByCenter);

router.route('/get-payments-overview-center').post(auth('getUsers'), accountsController.getPaymentsOverviewByCenter);

router.route('/get-pymt-transactions-center').get(auth('getUsers'), accountsController.getPymtTransactionsByCenter);

router.route('/add-bulk-payment-received').get(auth('getUsers'), accountsController.addBulkPaymentReceived);

router.route('/banks-list').get(auth('getUsers'), accountsController.bankList);

router.route('/pymt-bank-ref-exist').get(auth('getUsers'), accountsController.isPaymentBankRef);

router.route('/vendor-pymt-bank-ref-exist').get(auth('getUsers'), accountsController.vendorPaymentBankRef);

module.exports = router;
