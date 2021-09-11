const { responseForward } = require('../utils/utils');
const catchAsync = require('../utils/catchAsync');

const { dashboardService } = require('../services');

const getInquirySummary = catchAsync(async (req, res) => {
	const data = await dashboardService.getInquirySummary(req.body);

	return responseForward(data, 'Error: getInquirySummary', res);
});

const getSalesSummary = catchAsync(async (req, res) => {
	const data = await dashboardService.getSalesSummary(req.body);

	return responseForward(data, 'Error: getSalesSummary', res);
});

const getPurchaseSummary = catchAsync(async (req, res) => {
	const data = await dashboardService.getPurchaseSummary(req.body);

	return responseForward(data, 'Error: getPurchaseSummary', res);
});

const getSaleTotal = catchAsync(async (req, res) => {
	const data = await dashboardService.getSaleTotal(req.body);

	return responseForward(data, 'Error: getSaleTotal', res);
});

const getCenterSummary = catchAsync(async (req, res) => {
	const data = await dashboardService.getCenterSummary(req.body);

	return responseForward(data, 'Error: getCenterSummary', res);
});

const getReceivablesOutstanding = catchAsync(async (req, res) => {
	const data = await dashboardService.getReceivablesOutstanding(req.body);

	return responseForward(data, 'Error: getReceivablesOutstanding', res);
});

const getPaymentsByCustomers = catchAsync(async (req, res) => {
	const data = await dashboardService.getPaymentsByCustomers(req.body);

	return responseForward(data, 'Error: getPaymentsByCustomers', res);
});

const topClients = catchAsync(async (req, res) => {
	const data = await dashboardService.topClients(req.body);

	return responseForward(data, 'Error: topClients', res);
});

module.exports = {
	getInquirySummary,

	getSalesSummary,
	getPurchaseSummary,
	getSaleTotal,
	getCenterSummary,
	getReceivablesOutstanding,
	getPaymentsByCustomers,
	topClients,
};
