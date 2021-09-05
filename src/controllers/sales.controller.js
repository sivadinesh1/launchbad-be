const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { responseForward } = require('../utils/utils');
const catchAsync = require('../utils/catchAsync');
const { salesService } = require('../services');

const getNextSaleInvoiceNoAsync = catchAsync(async (req, res) => {
	const data = await salesService.getNextSaleInvoiceNoAsync(req.params.centerid, req.params.invoicetype);
	return responseForward(data, 'getNextSaleInvoiceNoAsync', res);
});

const deleteSalesDetails = catchAsync(async (req, res) => {
	const data = await salesService.deleteSalesDetails(req.body);
	return responseForward(data, 'deleteSalesDetails', res);
});

const insertSaleDetails = catchAsync(async (req, res) => {
	const data = await salesService.insertSaleDetails(request.body);
	return responseForward(data, 'insertSaleDetails', res);
});

const convertSale = catchAsync(async (req, res) => {
	const data = await salesService.convertSale(request.body);
	return responseForward(data, 'convertSale', res);
});

const deleteSale = catchAsync(async (req, res) => {
	const data = await salesService.deleteSale(req.params.id);
	return responseForward(data, 'deleteSale', res);
});

const deleteSaleMaster = catchAsync(async (req, res) => {
	const data = await salesService.deleteSaleMaster(req.params.id);
	return responseForward(data, 'deleteSaleMaster', res);
});

const getSaleMaster = catchAsync(async (req, res) => {
	const data = await salesService.getSaleMaster(req.params.sale_id);
	return responseForward(data, 'getSaleMaster', res);
});

const getSalesDetails = catchAsync(async (req, res) => {
	const data = await salesService.getSalesDetails(req.params.sale_id);
	return responseForward(data, 'getSalesDetails', res);
});

const updateGetPrintCounter = catchAsync(async (req, res) => {
	const data = await salesService.updateGetPrintCounter(req.params.sale_id);
	return responseForward(data, 'updateGetPrintCounter', res);
});

const getPrintCounter = catchAsync(async (req, res) => {
	const data = await salesService.getPrintCounter(req.params.sale_id);
	return responseForward(data, 'getPrintCounter', res);
});

const duplicateInvoiceNoCheck = catchAsync(async (req, res) => {
	const data = await salesService.duplicateInvoiceNoCheck(req.body.invoice_no, req.body.center_id);
	return responseForward(data, 'duplicateInvoiceNoCheck', res);
});

module.exports = {
	getNextSaleInvoiceNoAsync,
	deleteSalesDetails,
	insertSaleDetails,
	convertSale,
	deleteSale,
	deleteSaleMaster,
	getSaleMaster,
	getSalesDetails,
	updateGetPrintCounter,
	getPrintCounter,
	duplicateInvoiceNoCheck,
};
