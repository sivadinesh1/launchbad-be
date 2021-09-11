const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { responseForward } = require('../utils/utils');
const catchAsync = require('../utils/catchAsync');
const { returnsService } = require('../services');

const getReturns = catchAsync(async (req, res) => {
	const data = await returnsService.getReturns(req.user.center_id);
	return responseForward(data, 'getReturns', res);
});

const searchSaleReturn = catchAsync(async (req, res) => {
	const data = await returnsService.searchSaleReturn(req.body);
	return responseForward(data, 'searchSaleReturn', res);
});

const getSaleReturnDetails = catchAsync(async (req, res) => {
	const data = await returnsService.getSaleReturnDetails(req.user.center_id, req.params.salre_return_id);
	return responseForward(data, 'getSaleReturnDetails', res);
});

const updateSaleReturnsReceived = catchAsync(async (req, res) => {
	const data = await returnsService.updateSaleReturnsReceived(req.body);
	return responseForward(data, 'updateSaleReturnsReceived', res);
});

const showReceiveButton = catchAsync(async (req, res) => {
	const data = await returnsService.showReceiveButton(req.user.center_id, req.params.sale_return_id);
	return responseForward(data, 'showReceiveButton', res);
});

const addSaleReturn = catchAsync(async (req, res) => {
	const data = await returnsService.addSaleReturn(req.body);
	return responseForward(data, 'addSaleReturn', res);
});

module.exports = {
	getReturns,
	searchSaleReturn,
	getSaleReturnDetails,
	updateSaleReturnsReceived,
	showReceiveButton,
	addSaleReturn,
};
