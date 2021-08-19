const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { adminService } = require('../services');

const getProductsCount = catchAsync(async (req, res) => {
	const data = await adminService.getProductsCount(req.params.centerid);

	if (!data) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error fetching products count');
	}
	return res.status(200).send(data);
});

// const create = catchAsync(async (req, res) => {
//   const user = await userV2Servic.createUser(req.body);
//   res.status(httpStatus.CREATED).send(user);
// });

// const createGUser = catchAsync(async (req, res) => {
//   const user = await userV2Servic.createGUser(req.body);
//   res.status(httpStatus.CREATED).send(user);
// });

// const getUser = catchAsync(async (req, res) => {
//   const user = await userV2Servic.getUserById(req.params.id);
//   if (!user) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
//   }
//   res.send(user);
// });

// const getGUser = catchAsync(async (req, res) => {
//   const user = await userV2Servic.getBySocialMadiaId(req.params.mediaId);
//   if (!user) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
//   }
//   res.send(user);
// });

// const getUserByUsername = catchAsync(async (req, res) => {
//     const user = await userV2Servic.getUserByName(req.params.username);
//     if (!user) {
//       throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
//     }
//     res.send(user);
//   });

module.exports = {
	getProductsCount,
};
