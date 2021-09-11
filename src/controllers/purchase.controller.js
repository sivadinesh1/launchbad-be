const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { responseForward } = require('../utils/utils');
const catchAsync = require('../utils/catchAsync');
const { purchaseService } = require('../services');

const insertPurchaseDetails = catchAsync(async (req, res) => {
	const data = await purchaseService.insertPurchaseDetails(req.body);
	return responseForward(data, 'insertPurchaseDetails', res);
});

module.exports = {
	insertPurchaseDetails,
};
