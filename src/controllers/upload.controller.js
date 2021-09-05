const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { responseForward } = require('../utils/utils');
const catchAsync = require('../utils/catchAsync');
const { uploadService } = require('../services');

const uploadLogo = catchAsync(async (req, res) => {
	const data = await uploadService.uploadLogo(req.params.centerid);
	return responseForward(data, 'uploadLogo', res);
});

module.exports = {
	uploadLogo,
};
