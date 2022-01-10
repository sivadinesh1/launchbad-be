const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { responseForward } = require('../utils/utils');
const catchAsync = require('../utils/catchAsync');
const { stockService, salesService } = require('../services');

const searchAllDraftPurchase = catchAsync(async (req, res) => {
	const data = await stockService.searchAllDraftPurchase(req.user.center_id);
	return responseForward(data, 'searchAllDraftPurchase', res);
});

const searchPurchase = catchAsync(async (req, res) => {
	const data = await stockService.searchPurchase(req.body);
	return responseForward(data, 'searchPurchase', res);
});

const searchSales = catchAsync(async (req, res) => {
	const data = await stockService.searchSales(req.body);
	return responseForward(data, 'searchSales', res);
});

const purchaseMaster = catchAsync(async (req, res) => {
	const data = await stockService.purchaseMaster(req.params.id);
	return responseForward(data, 'purchaseMaster', res);
});

const getSalesMaster = catchAsync(async (req, res) => {
	const data = await salesService.getSalesMaster(req.params.id);
	return responseForward(data, 'getSalesMaster', res);
});

const getSalesDetails = catchAsync(async (req, res) => {
	const data = await salesService.getSalesDetails(req.params.id);
	return responseForward(data, 'getSalesDetails', res);
});

const deleteSaleDetails = catchAsync(async (req, res) => {
	const data = await stockService.deleteSaleDetails(req.body.id);
	return responseForward(data, 'deleteSaleDetails', res);
});

const deleteItemHistory = catchAsync(async (req, res) => {
	const data = await stockService.deleteItemHistory(req.params.saleid);
	return responseForward(data, 'deleteItemHistory', res);
});

const purchaseDetails = catchAsync(async (req, res) => {
	const data = await stockService.purchaseDetails(req.params.id);
	return responseForward(data, 'purchaseDetails', res);
});

const deletePurchaseDetails = catchAsync(async (req, res) => {
	const data = await stockService.deletePurchaseDetails(req.body);
	return responseForward(data, 'deletePurchaseDetails', res);
});

const deletePurchaseById = catchAsync(async (req, res) => {
	const data = await stockService.deletePurchaseById(req.params.id);
	return responseForward(data, 'deletePurchaseById', res);
});

const deletePurchaseMasterById = catchAsync(async (req, res) => {
	const data = await stockService.deletePurchaseMasterById(req.params.id);
	return responseForward(data, 'deletePurchaseMasterById', res);
});

const getProductWithAllMRP = catchAsync(async (req, res) => {
	const data = await stockService.getProductWithAllMRP(req.params.product_id);
	return responseForward(data, 'getProductWithAllMRP', res);
});

const deleteProductFromStock = catchAsync(async (req, res) => {
	const data = await stockService.deleteProductFromStock(
		req.params.product_id,
		req.params.mrp,
		req.user.center_id,
		req.params.is_active,
		Number(req.user.id)
	);
	return responseForward(data, 'deleteProductFromStock', res);
});

const stockCorrection = catchAsync(async (req, res) => {
	req.body.updated_by = Number(req.user.id);
	req.body.center_id = req.user.center_id;

	const data = await stockService.stockCorrection(req.body);
	return responseForward(data, 'stockCorrection', res);
});

module.exports = {
	searchAllDraftPurchase,
	searchPurchase,
	searchSales,
	purchaseMaster,
	getSalesMaster,
	getSalesDetails,
	deleteSaleDetails,
	deleteItemHistory,
	purchaseDetails,
	deletePurchaseDetails,
	deletePurchaseById,
	deletePurchaseMasterById,
	getProductWithAllMRP,
	deleteProductFromStock,
	stockCorrection,
};
