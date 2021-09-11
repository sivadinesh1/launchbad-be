const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { responseForward } = require('../utils/utils');
const catchAsync = require('../utils/catchAsync');
const { authService, userService } = require('../services');
const { MAX_AGE, setTokenCookie, getTokenCookie } = require('../utils/auth-cookies');

const updateCenterForSuperAdmin = catchAsync(async (req, res) => {
	const data = await authService.updateCenterForSuperAdmin(req.body.center_id);

	return responseForward(data, 'updateCenterForSuperAdmin', res);
});

const login = catchAsync(async (req, res) => {
	const data = await authService.login(req.body);

	console.log('object1' + JSON.stringify(data));
	let { role, center_id, id } = data;

	const token = await authService.generateToken(id, center_id, role);

	console.log('object.....' + token);

	await setTokenCookie(res, token);

	// generate token for user
	//set token in cookie

	return responseForward(data, 'login', res);
});

const fetchPermissions = catchAsync(async (req, res) => {
	const data = await authService.getPermissions(req.params.centerid, req.params.roleid);

	return responseForward(data, 'fetchPermissions', res);
});

const fetchLogs = catchAsync(async (req, res) => {
	let filePath = '/usr/local/server/reddotuat/logs/log.log';

	// if (process.env.NODE_ENV === 'development') {
	// 	filePath = process.env.DEV_LOG_PATH;
	// } else if (process.env.NODE_ENV === 'production') {
	// 	filePath = process.env.PROD_LOG_PATH;
	// } else if (process.env.NODE_ENV === 'uat') {
	// 	filePath = process.env.UAT_LOG_PATH;
	// }

	res.sendFile(filePath);
});

const fetchAccessLogs = catchAsync(async (req, res) => {
	let filePath = '/usr/local/server/reddotuat/logs/access-log.log';

	// if (process.env.NODE_ENV === 'development') {
	// 	filePath = process.env.DEV_ACCESS_LOG_PATH;
	// } else if (process.env.NODE_ENV === 'production') {
	// 	filePath = process.env.PROD_ACCESS_LOG_PATH;
	// } else if (process.env.NODE_ENV === 'uat') {
	// 	filePath = process.env.UAT_ACCESS_LOG_PATH;
	// }

	res.sendFile(filePath);
});

const fetchUser = catchAsync(async (req, res) => {
	console.log('dinesh!!');
	const data = await userService.findOne(req.params.id);

	return responseForward(data, 'fetchUser', res);
});

module.exports = {
	updateCenterForSuperAdmin,
	login,
	fetchPermissions,
	fetchLogs,
	fetchAccessLogs,
	fetchUser,
};

// let center_id = req.body.center_id;

// const result = updateCenterForSuperAdmin(center_id);

// return res.status(200).json({
// 	result: 'success',
// });
