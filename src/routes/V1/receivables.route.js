const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');

const receivablesController = require('../../controllers/receivables.controller');

router
	.route('/get-payments-received')
	.post(auth('getUsers'), receivablesController.getPaymentsReceived);

router
	.route('/get-payments-received-details')
	.post(auth('getUsers'), receivablesController.getPaymentsReceivedDetails);

router
	.route('/get-edit-payments-receivables-data/:payment_id')
	.get(auth('getUsers'), receivablesController.getEditPaymentsData);

router
	.route('/get-pending-invoices/:customer_id')
	.get(auth('getUsers'), receivablesController.getPendingInvoices);

router
	.route('/get-pending-receivables')
	.post(auth('getUsers'), receivablesController.getPendingReceivables);

router
	.route('/get-excess-paid-payments/:customer_id')
	.get(auth('getUsers'), receivablesController.getExcessPaidPayments);

module.exports = router;
