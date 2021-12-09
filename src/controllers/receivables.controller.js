const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { responseForward } = require('../utils/utils');
const catchAsync = require('../utils/catchAsync');
const { receivablesService } = require('../services');

const getPaymentsReceived = catchAsync(async (req, res) => {
	const data = await receivablesService.getPaymentsReceived(
		req.user.center_id,
		req.body.customer_id,
		req.body.from_date,
		req.body.to_date,
		req.body.invoice_no,
		req.body.order
	);

	return responseForward(data, 'getPaymentsReceived', res);
});

const getPaymentsReceivedDetails = catchAsync(async (req, res) => {
	const data = await receivablesService.getPaymentsReceivedDetails(
		req.body.payment_id
	);

	return responseForward(data, 'getPaymentsReceivedDetails', res);
});

const getEditPaymentsData = catchAsync(async (req, res) => {
	const data = await receivablesService.getEditPaymentsData(
		req.params.payment_id
	);

	return responseForward(data, 'getEditPaymentsData', res);
});

const getPendingInvoices = catchAsync(async (req, res) => {
	const data = await receivablesService.getPendingInvoices(
		req.user.center_id,
		req.params.customer_id
	);

	return responseForward(data, 'getPendingInvoices', res);
});

const getPendingReceivables = catchAsync(async (req, res) => {
	const data = await receivablesService.getPendingReceivables(
		req.user.center_id,
		req.body.customer_id,
		req.body.from_date,
		req.body.to_date,
		req.body.invoice_no,
		req.body.order
	);

	return responseForward(data, 'getPendingReceivables', res);
});

const getExcessPaidPayments = catchAsync(async (req, res) => {
	const data = await receivablesService.getExcessPaidPayments(
		req.params.customer_id
	);

	return responseForward(data, 'getExcessPaidPayments', res);
});

module.exports = {
	getPaymentsReceived,
	getPaymentsReceivedDetails,
	getEditPaymentsData,
	getPendingInvoices,
	getPendingReceivables,
	getExcessPaidPayments,
};
