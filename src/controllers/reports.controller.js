const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { responseForward } = require('../utils/utils');
const catchAsync = require('../utils/catchAsync');
const { inventoryReportsService, productSummaryReportsService, statementReportsService } = require('../services');

const fullStockReport = catchAsync(async (req, res) => {
	const data = await inventoryReportsService.fullStockReport(req.user.center_id, req.body.mrp_split);
	return responseForward(data, 'fullStockReport', res);
});

const getProductInventoryReport = catchAsync(async (req, res) => {
	const data = await inventoryReportsService.getProductInventoryReport(req.body);
	return responseForward(data, 'getProductInventoryReport', res);
});

const getProductInventoryReportShort = catchAsync(async (req, res) => {
	const data = await inventoryReportsService.getProductInventoryReportShort(req.body);
	return responseForward(data, 'getProductInventoryReportShort', res);
});

const getProductSummaryReport = catchAsync(async (req, res) => {
	const data = await productSummaryReportsService.getProductSummaryReport(req.body);
	return responseForward(data, 'getProductSummaryReport', res);
});

const getStatement = catchAsync(async (req, res) => {
	const data = await statementReportsService.getStatement(req.body);
	return responseForward(data, 'getStatement', res);
});

const getVendorStatement = catchAsync(async (req, res) => {
	const data = await statementReportsService.getVendorStatement(req.body);
	return responseForward(data, 'getVendorStatement', res);
});

const getReceivablesClosingBalance = catchAsync(async (req, res) => {
	const data = await statementReportsService.getReceivablesClosingBalance(req.body);
	return responseForward(data, 'getReceivablesClosingBalance', res);
});

const getReceivablesOpeningBalance = catchAsync(async (req, res) => {
	const data = await statementReportsService.getReceivablesOpeningBalance(req.body);
	return responseForward(data, 'getReceivablesOpeningBalance', res);
});

const getItemWiseSale = catchAsync(async (req, res) => {
	const data = await statementReportsService.getItemWiseSale(req.body);
	return responseForward(data, 'getItemWiseSale', res);
});

module.exports = {
	fullStockReport,
	getProductInventoryReport,
	getProductInventoryReportShort,
	getProductSummaryReport,
	getStatement,
	getVendorStatement,
	getReceivablesClosingBalance,
	getReceivablesOpeningBalance,
	getItemWiseSale,
};
