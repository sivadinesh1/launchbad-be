const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { responseForward } = require('../utils/utils');
const catchAsync = require('../utils/catchAsync');
const { generalService, vendorsService, productsService, customersService, brandsService, enquiryService } = require('../services');

const searchProductInformation = catchAsync(async (req, res) => {
	const data = await generalService.searchProductInformation(req.body);

	return responseForward(data, 'searchProductInformation', res);
});

const searchProduct = catchAsync(async (req, res) => {
	const data = await productsService.searchProduct(req.body.center_id, req.body.product_search_text);

	return responseForward(data, 'searchProduct', res);
});

const searchCustomer = catchAsync(async (req, res) => {
	const data = await customersService.getSearchCustomers(req.user.center_id, req.body.search_text);

	return responseForward(data, 'searchCustomer', res);
});

const searchVendors = catchAsync(async (req, res) => {
	const data = await vendorsService.getSearchVendors(req.user.center_id, req.body.search_text);

	return responseForward(data, 'searchVendors', res);
});

const searchBrand = catchAsync(async (req, res) => {
	const data = await brandsService.getSearchBrands(req.user.center_id, req.body.search_text);

	return responseForward(data, 'searchBrand', res);
});

const getAllInventory = catchAsync(async (req, res) => {
	const data = await generalService.getAllInventory();

	return responseForward(data, 'getAllInventory', res);
});

const getAllClients = catchAsync(async (req, res) => {
	const data = await generalService.getAllClients();

	return responseForward(data, 'getAllClients', res);
});

const getAllActiveVendors = catchAsync(async (req, res) => {
	const data = await generalService.getAllActiveVendors(req.user.center_id);
	return responseForward(data, 'getAllActiveVendors', res);
});

const getAllActiveBrands = catchAsync(async (req, res) => {
	const data = await brandsService.getAllBrands(Number(req.user.center_id), req.params.status);
	return responseForward(data, 'getAllActiveBrands', res);
});

const isVendorExists = catchAsync(async (req, res) => {
	const data = await vendorsService.isVendorExists(req.params.name, req.user.center_id);
	return responseForward(data, 'isVendorExists', res);
});

const isCustomerExists = catchAsync(async (req, res) => {
	const data = await customersService.isCustomerExists(req.params.name, req.user.center_id);
	return responseForward(data, 'isCustomerExists', res);
});

const isBrandExists = catchAsync(async (req, res) => {
	const data = await brandsService.isBrandExists(Number(req.user.center_id), req.params.name);

	return responseForward(data, 'isBrandExists', res);
});

const deleteBrand = catchAsync(async (req, res) => {
	const data = await brandsService.deleteBrand(req.params.id);
	return responseForward(data, 'deleteBrand', res);
});

const deleteEnquiry = catchAsync(async (req, res) => {
	const data = await enquiryService.deleteEnquiry(req.params.id);
	return responseForward(data, 'deleteEnquiry', res);
});

const deleteVendor = catchAsync(async (req, res) => {
	const data = await vendorsService.deleteVendor(req.params.id);
	return responseForward(data, 'deleteVendor', res);
});

const getBrandsMissingDiscountsByCustomer = catchAsync(async (req, res) => {
	const data = await brandsService.getBrandsMissingDiscountsByCustomer(req.user.center_id, req.params.status, req.params.customer_id);
	return responseForward(data, 'getBrandsMissingDiscountsByCustomer', res);
});

const getAllActiveCustomersByCenter = catchAsync(async (req, res) => {
	const data = await generalService.getAllActiveCustomersByCenter(req.user.center_id);
	return responseForward(data, 'getAllActiveCustomersByCenter', res);
});

const addPartsDetailsEnquiry = catchAsync(async (req, res) => {
	const data = await generalService.addPartsDetailsEnquiry(req.body);
	return responseForward(data, 'addPartsDetailsEnquiry', res);
});

const getEnquiryById = catchAsync(async (req, res) => {
	const data = await enquiryService.getEnquiryById(req.params.enquiry_id);
	return responseForward(data, 'getEnquiryById', res);
});

const getCustomerDetailsById = catchAsync(async (req, res) => {
	const data = await enquiryService.getCustomerDetailsById(req.params.enquiry_id);
	return responseForward(data, 'getCustomerDetailsById', res);
});

const updateTaxRate = catchAsync(async (req, res) => {
	const data = await generalService.updateTaxRate(req.body);
	return responseForward(data, 'updateTaxRate', res);
});

const getAllPaymentModes = catchAsync(async (req, res) => {
	const data = await generalService.getAllPaymentModes(req.user.center_id, req.params.status);
	return responseForward(data, 'getAllPaymentModes', res);
});

module.exports = {
	searchProductInformation,
	searchProduct,
	searchCustomer,
	searchVendors,
	searchBrand,
	getAllInventory,
	getAllClients,
	getAllActiveVendors,
	getAllActiveBrands,
	isVendorExists,
	isCustomerExists,
	isBrandExists,
	deleteBrand,
	deleteEnquiry,
	deleteVendor,
	getBrandsMissingDiscountsByCustomer,
	getAllActiveCustomersByCenter,
	addPartsDetailsEnquiry,
	getEnquiryById,
	getCustomerDetailsById,
	updateTaxRate,
	getAllPaymentModes,
};
