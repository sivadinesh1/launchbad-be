const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { responseForward } = require('../utils/utils');
const catchAsync = require('../utils/catchAsync');
const { enquiryService } = require('../services');

const draftEnquiry = catchAsync(async (req, res) => {
	const data = await enquiryService.draftEnquiry(req.body);

	return responseForward(data, 'draftEnquiry', res);
});

const moveToSale = catchAsync(async (req, res) => {
	const data = await enquiryService.moveToSale(
		req.body,
		req.user.center_id,
		req.user.id
	);

	return responseForward(data, 'moveToSale', res);
});

const updateGiveqtyEnquiryDetails = catchAsync(async (req, res) => {
	const data = await enquiryService.updateGiveqtyEnquiryDetails(req.body);

	return responseForward(data, 'updateGiveqtyEnquiryDetails', res);
});

const updateCustomerEnquiry = catchAsync(async (req, res) => {
	const data = await enquiryService.updateCustomerEnquiry(
		req.params.id,
		req.params.enqid
	);

	return responseForward(data, 'updateCustomerEnquiry', res);
});

const update_statusEnquiryDetails = catchAsync(async (req, res) => {
	const data = await enquiryService.update_statusEnquiryDetails(req.body);

	return responseForward(data, 'update_statusEnquiryDetails', res);
});

const updateEnquiryDetails = catchAsync(async (req, res) => {
	const data = await enquiryService.updateEnquiryDetails(req.body);

	return responseForward(data, 'updateEnquiryDetails', res);
});

const insertEnquiryDetails = catchAsync(async (req, res) => {
	const data = await enquiryService.insertEnquiryDetailsTxn(
		req.body,
		req.user.center_id,
		req.user.id
	);

	return responseForward(data, 'insertEnquiryDetails', res);
});

const addMoreEnquiryDetails = catchAsync(async (req, res) => {
	const data = await enquiryService.addMoreEnquiryDetails(
		req.body,
		req.user.center_id,
		req.user.id
	);

	return responseForward(data, 'addMoreEnquiryDetails', res);
});

const openEnquiries = catchAsync(async (req, res) => {
	const data = await enquiryService.openEnquiries(
		req.user.center_id,
		req.params.status
	);

	return responseForward(data, 'openEnquiries', res);
});

const getEnquiryDetails = catchAsync(async (req, res) => {
	const data = await enquiryService.getEnquiryDetails(req.params.enqid);

	return responseForward(data, 'getEnquiryDetails', res);
});

const getEnquiryMaster = catchAsync(async (req, res) => {
	const data = await enquiryService.getEnquiryMaster(req.params.enqid);

	return responseForward(data, 'getEnquiryMaster', res);
});

const getCustomerData = catchAsync(async (req, res) => {
	const data = await enquiryService.getCustomerData(req.params.enqid);

	return responseForward(data, 'getCustomerData', res);
});

const getEnquiredProductData = catchAsync(async (req, res) => {
	let center_id = req.user.center_id;
	let customer_id = req.params.customer_id;
	let enqid = req.params.enqid;
	let orderdate = req.params.invdt;
	const data = await enquiryService.getEnquiredProductData(
		center_id,
		customer_id,
		enqid,
		orderdate
	);

	return responseForward(data, 'getEnquiredProductData', res);
});

const getBackOrder = catchAsync(async (req, res) => {
	const data = await enquiryService.getBackOrder(req.user.center_id);

	return responseForward(data, 'getBackOrder', res);
});

const searchEnquiries = catchAsync(async (req, res) => {
	const data = await enquiryService.searchEnquiries(
		req.body,
		req.user.center_id
	);

	return responseForward(data, 'searchEnquiries', res);
});

const deleteEnquiryDetails = catchAsync(async (req, res) => {
	const data = await enquiryService.deleteEnquiryDetails(req.body);

	return responseForward(data, 'deleteEnquiryDetails', res);
});

module.exports = {
	draftEnquiry,
	moveToSale,
	updateGiveqtyEnquiryDetails,
	updateCustomerEnquiry,
	update_statusEnquiryDetails,
	updateEnquiryDetails,
	insertEnquiryDetails,
	addMoreEnquiryDetails,
	openEnquiries,
	getEnquiryDetails,
	getEnquiryMaster,
	getCustomerData,
	getEnquiredProductData,
	getBackOrder,
	searchEnquiries,
	deleteEnquiryDetails,
};
