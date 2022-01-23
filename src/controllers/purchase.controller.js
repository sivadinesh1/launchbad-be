const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { responseForward } = require('../utils/utils');
const catchAsync = require('../utils/catchAsync');
const { purchaseService } = require('../services');

const insertPurchase = catchAsync(async (req, res) => {
	try {
		let purchaseObject = req.body;
		// purchaseObject.updated_by = Number(req.user.id);

		const data = await purchaseService.insertPurchase(
			purchaseObject,
			Number(req.user.id)
		);
		return responseForward(data, 'insertPurchaseDetails', res);
	} catch (error) {
		console.log('ERROR:' + JSON.stringify(error));
	}
});

const deletePurchaseDetails = catchAsync(async (req, res) => {
	const data = await purchaseService.deletePurchaseDetails(
		req.body,
		Number(req.user.center_id),
		Number(req.user.id)
	);
	return responseForward(data, 'deletePurchaseDetails', res);
});

module.exports = {
	insertPurchase,
	deletePurchaseDetails,
};
