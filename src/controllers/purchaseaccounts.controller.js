const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { responseForward } = require('../utils/utils');
const catchAsync = require('../utils/catchAsync');
const {
	generalService,
	vendorsService,
	customersService,
	brandsService,
	enquiryService,
	purchaseaccountsService,
	printService,
} = require('../services');

const insertPurchaseDetails = catchAsync(async (req, res) => {
	const data = await generalService.insertPurchaseDetails(req.body);
	return responseForward(data, 'insertPurchaseDetails', res);
});

const getPurchaseInvoiceByCenter = catchAsync(async (req, res) => {
	const data = await purchaseaccountsService.getPurchaseInvoiceByCenter(req.body);
	return responseForward(data, 'getPurchaseInvoiceByCenter', res);
});

const addVendorPaymentReceived = catchAsync(async (req, res) => {
	const data = await purchaseaccountsService.addVendorPaymentReceived(req.body);
	return responseForward(data, 'addVendorPaymentReceived', res);
});

const addBulkVendorPaymentReceived = catchAsync(async (req, res) => {
	const data = await purchaseaccountsService.addBulkVendorPaymentReceived(req.body);
	return responseForward(data, 'addBulkVendorPaymentReceived', res);
});

const getVendorPaymentsByCenter = catchAsync(async (req, res) => {
	const data = await purchaseaccountsService.getVendorPaymentsByCenter(req.body);
	return responseForward(data, 'getVendorPaymentsByCenter', res);
});

const getPurchaseInvoiceByVendors = catchAsync(async (req, res) => {
	const data = await purchaseaccountsService.getPurchaseInvoiceByVendors(req.body);
	return responseForward(data, 'getPurchaseInvoiceByVendors', res);
});

const getPaymentsByVendors = catchAsync(async (req, res) => {
	const data = await purchaseaccountsService.getPaymentsByVendors(req.body);
	return responseForward(data, 'getPaymentsByVendors', res);
});

const getLedgerByVendors = catchAsync(async (req, res) => {
	const data = await purchaseaccountsService.getLedgerByVendors(req.params.centerid, req.params.vendorid);
	return responseForward(data, 'getLedgerByVendors', res);
});

module.exports = {
	insertPurchaseDetails,
	getPurchaseInvoiceByCenter,
	addVendorPaymentReceived,
	addBulkVendorPaymentReceived,
	getVendorPaymentsByCenter,
	getPurchaseInvoiceByVendors,
	getPaymentsByVendors,
	getLedgerByVendors,
};
