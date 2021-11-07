const { plainToClass } = require('class-transformer');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { responseForward } = require('../utils/utils');
const catchAsync = require('../utils/catchAsync');
const { salesService } = require('../services');

const { Sale } = require('../domain/Sale');
const { SaleDetail } = require('../domain/SaleDetail');

const getNextSaleInvoiceNoAsync = catchAsync(async (req, res) => {
	const data = await salesService.getNextInvSequenceNo(req.user.center_id, req.params.invoice_type);
	return responseForward(data, 'getNextSaleInvoiceNoAsync', res);
});

const deleteSalesDetails = catchAsync(async (req, res) => {
	const data = await salesService.deleteSalesDetails(req.body);
	return responseForward(data, 'deleteSalesDetails', res);
});

const insertSale = catchAsync(async (req, res) => {
	let saleMaster = plainToClass(Sale, req.body.sale);
	let saleDetails = plainToClass(SaleDetail, req.body.saleDetails);

	saleMaster.updated_by = Number(req.user.id);
	saleDetails.updated_by = Number(req.user.id);

	const data = await salesService.insertSale(saleMaster, saleDetails);

	return responseForward(data, 'insertSale>>', res);
});

const convertSale = catchAsync(async (req, res) => {
	const data = await salesService.convertSale(req.body);
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

const getSalesMaster = catchAsync(async (req, res) => {
	const data = await salesService.getSalesMaster(req.params.sale_id);
	return responseForward(data, 'getSalesMaster', res);
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
	const data = await salesService.duplicateInvoiceNoCheck(req.body.invoice_no, req.user.center_id);
	return responseForward(data, 'duplicateInvoiceNoCheck', res);
});

module.exports = {
	getNextSaleInvoiceNoAsync,
	deleteSalesDetails,
	insertSale,
	convertSale,
	deleteSale,
	deleteSaleMaster,
	getSalesMaster,
	getSalesDetails,
	updateGetPrintCounter,
	getPrintCounter,
	duplicateInvoiceNoCheck,
};
