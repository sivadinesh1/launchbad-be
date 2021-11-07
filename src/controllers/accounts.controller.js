const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { responseForward } = require('../utils/utils');
const catchAsync = require('../utils/catchAsync');
const { accountsService } = require('../services');

const addPaymentReceived = catchAsync(async (req, res) => {
	const data = await accountsService.addPaymentReceived(req.body);

	return responseForward(data, 'addPaymentReceived', res);
});

const getLedgerByCustomers = catchAsync(async (req, res) => {
	const data = await accountsService.getLedgerByCustomers(req.user.center_id, req.params.customer_id);

	return responseForward(data, 'getLedgerByCustomers', res);
});

const getSaleInvoiceByCustomers = catchAsync(async (req, res) => {
	const data = await accountsService.getSaleInvoiceByCustomers(req.body);

	return responseForward(data, 'getSaleInvoiceByCustomers', res);
});

const getSaleInvoiceByCenter = catchAsync(async (req, res) => {
	const data = await accountsService.getSaleInvoiceByCenter(req.body);

	return responseForward(data, 'getSaleInvoiceByCenter', res);
});

const getPaymentsByCustomers = catchAsync(async (req, res) => {
	const data = await accountsService.getPaymentsByCustomers(req.body);

	return responseForward(data, 'getPaymentsByCustomers', res);
});

const getPaymentsOverviewByCustomers = catchAsync(async (req, res) => {
	const data = await accountsService.getPaymentsOverviewByCustomers(req.body);

	return responseForward(data, 'getPaymentsOverviewByCustomers', res);
});

const getPymtTransactionByCustomers = catchAsync(async (req, res) => {
	const data = await accountsService.getPymtTransactionByCustomers(req.user.center_id, req.params.customer_id);

	return responseForward(data, 'getPymtTransactionByCustomers', res);
});

const getPaymentsByCenter = catchAsync(async (req, res) => {
	const data = await accountsService.getPaymentsByCenter(req.body);

	return responseForward(data, 'getPaymentsByCenter', res);
});

const getPaymentsOverviewByCenter = catchAsync(async (req, res) => {
	const data = await accountsService.getPaymentsOverviewByCenter(req.body);

	return responseForward(data, 'getPaymentsOverviewByCenter', res);
});

const getPymtTransactionsByCenter = catchAsync(async (req, res) => {
	const data = await accountsService.getPymtTransactionsByCenter(req.user.center_id);

	return responseForward(data, 'getPymtTransactionsByCenter', res);
});

const addBulkPaymentReceived = catchAsync(async (req, res) => {
	const data = await accountsService.addBulkPaymentReceived(req.body);

	return responseForward(data, 'addBulkPaymentReceived', res);
});

const bankList = catchAsync(async (req, res) => {
	const data = await accountsService.bankList(req.user.center_id);

	return responseForward(data, 'bankList', res);
});

const isPaymentBankRef = catchAsync(async (req, res) => {
	const data = await accountsService.isPaymentBankRef(req.body);

	return responseForward(data, 'isPaymentBankRef', res);
});

const vendorPaymentBankRef = catchAsync(async (req, res) => {
	const data = await accountsService.vendorPaymentBankRef(req.body);

	return responseForward(data, 'vendorPaymentBankRef', res);
});

module.exports = {
	addPaymentReceived,
	getLedgerByCustomers,
	getSaleInvoiceByCustomers,
	getSaleInvoiceByCenter,
	getPaymentsByCustomers,
	getPaymentsOverviewByCustomers,
	getPymtTransactionByCustomers,
	getPaymentsByCenter,
	getPaymentsOverviewByCenter,
	getPymtTransactionsByCenter,
	addBulkPaymentReceived,
	bankList,
	isPaymentBankRef,
	vendorPaymentBankRef,
};
