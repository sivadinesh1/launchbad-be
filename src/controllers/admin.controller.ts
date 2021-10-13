import { plainToClass } from 'class-transformer';
import { Brand, IBrand } from '../domain/Brand';
import { IProduct, Product } from '../domain/Product';
import { IVendor, Vendor } from '../domain/Vendor';
import { ProductMap } from '../mappers/product.mapper';

const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { responseForward } = require('../utils/utils');
const catchAsync = require('../utils/catchAsync');
const {
	adminService,
	customersService,
	productsService,
	vendorsService,
	brandsService,
	authService,
	stockService,
	centerService,
	userService,
} = require('../services');

const getProductsCount = catchAsync(async (req: any, res: any) => {
	const data = await adminService.getProductsCount(req.user.center_id);

	return responseForward(data, 'getProductsCount', res);
});

const getProductInfo = catchAsync(async (req: any, res: any) => {
	const data = await adminService.getProductInfo(req.user.center_id, req.params.productid);

	return responseForward(data, 'getProductInfo', res);
});

const addProduct = catchAsync(async (req: any, res: any) => {
	let product = plainToClass(Product, req.body as IProduct);

	product.created_by = Number(req.user.id);
	const data = await productsService.insertProduct(product);
	// dnd
	//let productDTO = ProductMap.toDTO(data);

	return responseForward('PRODUCT_ADDED', 'addProduct', res, 201);
});

const updateProduct = catchAsync(async (req: any, res: any) => {
	let product = plainToClass(Product, req.body as IProduct);

	product.updated_by = Number(req.user.id);

	const data = await productsService.updateProduct(product);

	res.status(200).json({
		result: 'success',
	});

	// if (response === 'success') {
	// 	const stockcount = await stockService.isStockIdExist({ product_id: jsonObj.product_id, mrp: jsonObj.mrp });

	// 	if (stockcount === 0) {
	// 		// add entry to stock with new mrp and stock as 0
	// 		// add entry in history table with new mrp and stock as same old stock
	// 		let stockid = await stockService.insertToStock(jsonObj.product_id, jsonObj.mrp, '0', '0');

	// 		let data = await stockService.insertItemHistoryTable(
	// 			jsonObj.center_id,
	// 			'Product',
	// 			jsonObj.product_id,
	// 			'0',
	// 			'0',
	// 			'0',
	// 			'0',
	// 			'PRD',
	// 			`MRP Change - ${jsonObj.mrp}`,
	// 			'0',
	// 			'0', // sale_return_id
	// 			'0', // sale_return_det_id
	// 			'0', // purchase_return_id
	// 			'0', // purchase_return_det_id
	// 		);

	// 		if (!data) {
	// 			throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error adding new product');
	// 		}
	// 	}
	// 	res.status(200).json({
	// 		result: 'success',
	// 	});
	// }
});

const getVendorDetails = catchAsync(async (req: any, res: any) => {
	const data = await vendorsService.getVendorDetails(req.user.center_id, req.params.vendorid);

	return responseForward(data, 'getVendorDetails', res);
});

const getStates = catchAsync(async (req: any, res: any) => {
	const data = await adminService.getStates();

	return responseForward(data, 'getStates', res);
});

const getTimezones = catchAsync(async (req: any, res: any) => {
	const data = await adminService.getTimezones();

	return responseForward(data, 'getTimezones', res);
});

const updateVendor = catchAsync(async (req: any, res: any) => {
	let vendor = plainToClass(Vendor, req.body as IVendor);

	vendor.updated_by = Number(req.user.id);
	const data = await vendorsService.updateVendor(vendor);
	return responseForward(data, 'updateVendor', res);
});

export const updateBrand = catchAsync(async (req: any, res: any) => {
	let brand = plainToClass(Brand, req.body as IBrand);

	brand.updated_by = Number(req.user.id);

	const data = await brandsService.updateBrand(brand);
	return responseForward(data, 'updateBrand', res);
});

const addVendor = catchAsync(async (req: any, res: any) => {
	let vendor = plainToClass(Brand, req.body as IVendor);

	vendor.created_by = Number(req.user.id);

	const data = await vendorsService.insertVendor(req.body);
	return responseForward(data, 'addVendor', res, httpStatus.CREATED);
});

const addBrand = catchAsync(async (req: any, res: any) => {
	let brand = plainToClass(Brand, req.body as IBrand);
	brand.created_by = Number(req.user.id);

	const data = await brandsService.insertBrand(brand);
	return responseForward(data, 'addBrand', res);
});

const getCustomerDetails = catchAsync(async (req: any, res: any) => {
	const data = await customersService.getCustomerDetails(req.user.center_id, req.params.customerid);

	return responseForward(data, 'getCustomerDetails', res);
});

const addCustomer = catchAsync(async (req: any, res: any) => {
	const data = await customersService.insertCustomer(req.body);
	return responseForward(data, 'getCustomerDetails', res);
});

const updateCustomer = catchAsync(async (req: any, res: any) => {
	const data = await customersService.updateCustomer(req.body, req.params.id);

	return responseForward(data, 'updateCustomer', res);
});

const getCenterDetails = catchAsync(async (req: any, res: any) => {
	const data = await centerService.getCenterDetails(req.user.center_id);

	return responseForward(data, 'getCenterDetails', res);
});

const updateCenter = catchAsync(async (req: any, res: any) => {
	const data = await centerService.updateCenter(req.body);
	return responseForward(data, 'updateCenter', res);
});

const isProductExists = catchAsync(async (req: any, res: any) => {
	const data = await productsService.isProductExists(req.params.pcode, req.user.center_id);

	return responseForward(data, 'isProductExists', res);
});

const addCustomerShippingAddress = catchAsync(async (req: any, res: any) => {
	const data = await customersService.insertCustomerShippingAddress(req.body);
	return responseForward(data, 'addCustomerShippingAddress', res);
});

const getCustomerShippingAddress = catchAsync(async (req: any, res: any) => {
	const data = await customersService.getCustomerShippingAddress(req.params.customerid);

	return responseForward(data, 'getCustomerShippingAddress', res);
});

const updateCustomerShippingAddress = catchAsync(async (req: any, res: any) => {
	const data = await customersService.updateCustomerShippingAddress(req.body, req.params.id);

	return responseForward(data, 'updateCustomerShippingAddress', res);
});

const inactivateCSA = catchAsync(async (req: any, res: any) => {
	const data = await customersService.inactivateCSA(req.body.id);
	return responseForward(data, 'inactivateCSA', res);
});

const getCustomerDiscount = catchAsync(async (req: any, res: any) => {
	const data = await customersService.getCustomerDiscount(req.user.center_id, req.params.customerid);

	return responseForward(data, 'getCustomerDiscount', res);
});

const getAllCustomerDefaultDiscounts = catchAsync(async (req: any, res: any) => {
	const data = await customersService.getAllCustomerDefaultDiscounts(req.user.center_id, req.params.customerid);

	return responseForward(data, 'getAllCustomerDefaultDiscounts', res);
});

const getDiscountsByCustomer = catchAsync(async (req: any, res: any) => {
	const data = await customersService.getDiscountsByCustomer(req.user.center_id, req.params.customerid);
	return responseForward(data.ApiError, 'getDiscountsByCustomer', res);
});

const getDiscountsByCustomerByBrand = catchAsync(async (req: any, res: any) => {
	const data = await customersService.getDiscountsByCustomerByBrand(req.user.center_id, req.params.customerid);
	return responseForward(data, 'Error: getDiscountsByCustomerByBrand', res);
});

const updateDefaultCustomerDiscount = catchAsync(async (req: any, res: any) => {
	const data = await customersService.updateDefaultCustomerDiscount(req.body);
	return responseForward(data, 'Error: updateDefaultCustomerDiscount', res);
});

const insertDiscountsByBrands = catchAsync(async (req: any, res: any) => {
	const data = await customersService.insertDiscountsByBrands(req.body);

	return responseForward(data, 'Error: insertDiscountsByBrands', res);
});

const addUser = catchAsync(async (req: any, res: any) => {
	const data = await adminService.addUser(req.body);

	return responseForward(data, 'Error: addUser', res);
});

const updateUser = catchAsync(async (req: any, res: any) => {
	const data = await userService.updateUserStatus(req.body);

	return responseForward(data, 'Error: updateUser', res);
});

const getUsers = catchAsync(async (req: any, res: any) => {
	const data = await userService.getUsers(req.user.center_id, req.params.status);

	return responseForward(data, 'Error: getUsers', res);
});

const checkUsernameExists = catchAsync(async (req: any, res: any) => {
	const data = await authService.checkUsernameExists(req.params.phone, req.user.center_id);

	return responseForward(data, 'Error: checkUsernameExists', res);
});

const getOutstandingBalance = catchAsync(async (req: any, res: any) => {
	const data = await adminService.getOutstandingBalance(req.user.center_id, req.body.limit);

	return responseForward(data, 'Error: getOutstandingBalance', res);
});

const addBank = catchAsync(async (req: any, res: any) => {
	const data = await adminService.addBank(req.body);

	return responseForward(data, 'Error: addBank', res);
});

const updateBank = catchAsync(async (req: any, res: any) => {
	const data = await adminService.updateBank(req.body);

	return responseForward(data, 'Error: updateBank', res);
});

module.exports = {
	getProductsCount,
	getProductInfo,
	addProduct,
	updateProduct,
	getVendorDetails,
	getStates,
	getTimezones,
	updateVendor,
	updateBrand,

	addVendor,
	addBrand,
	getCustomerDetails,
	addCustomer,
	updateCustomer,
	getCenterDetails,
	updateCenter,
	isProductExists,
	addCustomerShippingAddress,
	getCustomerShippingAddress,
	updateCustomerShippingAddress,
	inactivateCSA,
	getCustomerDiscount,
	getAllCustomerDefaultDiscounts,
	getDiscountsByCustomer,
	getDiscountsByCustomerByBrand,
	updateDefaultCustomerDiscount,

	insertDiscountsByBrands,
	addUser,
	updateUser,
	getUsers,
	checkUsernameExists,
	getOutstandingBalance,
	addBank,
	updateBank,
};
