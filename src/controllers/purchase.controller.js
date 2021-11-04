const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { responseForward } = require('../utils/utils');
const catchAsync = require('../utils/catchAsync');
const { purchaseService } = require('../services');

const insertPurchase = catchAsync(async (req, res) => {
	try {
		let purchaseObject = req.body;
		purchaseObject.updated_by = Number(req.user.id);

		const data = await purchaseService.insertPurchase(purchaseObject);
		return responseForward(data, 'insertPurchaseDetails', res);
	} catch (error) {
		console.log('ERROR:' + JSON.stringify(error));
	}
});

module.exports = {
	insertPurchase,
};
