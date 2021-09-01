const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { responseForward } = require('../utils/utils');
const catchAsync = require('../utils/catchAsync');
const { generalService, vendorsService, customersService, brandsService, enquiryService, printService } = require('../services');

const insertPurchaseDetails = catchAsync(async (req, res) => {
	const data = await generalService.insertPurchaseDetails(req.body);
	return responseForward(data, 'insertPurchaseDetails', res);
});

module.exports = {
	insertPurchaseDetails,
};
