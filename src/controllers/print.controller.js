const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { responseForward } = require('../utils/utils');
const catchAsync = require('../utils/catchAsync');
const { generalService, vendorsService, customersService, brandsService, enquiryService, printService } = require('../services');

const invoicePDF = catchAsync(async (req, res) => {
	const data = await printService.invoicePDF(req.body, res);
});

const estimatePDF = catchAsync(async (req, res) => {
	const data = await printService.estimatePDF(req.body, res);
});

const creditNotePDF = catchAsync(async (req, res) => {
	const data = await printService.creditNotePDF(req.body, res);
});

module.exports = {
	invoicePDF,
	estimatePDF,
	creditNotePDF,
};
