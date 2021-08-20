const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
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
} = require('../services');

const getProductsCount = catchAsync(async (req, res) => {
	const data = await adminService.getProductsCount(req.params.centerid);

	if (!data) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error fetching products count');
	}
	return res.status(200).send(data);
});

const getProductInfo = catchAsync(async (req, res) => {
	const data = await adminService.getProductInfo(req.params.centerid, req.params.productid);

	if (!data) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error fetching products count');
	}
	return res.status(200).send(data);
});

const addProduct = catchAsync(async (req, res) => {
	const data = await productsService.insertProduct(req.body);

	if (!data) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error adding new product');
	}

	if (data.affectedRows === 1) {
		return res.status(200).json({
			result: 'success',
		});
	}
});

const updateProduct = catchAsync(async (req, res) => {
	const jsonObj = req.body;
	const response = await productsService.updateProduct(jsonObj);

	if (response === 'success') {
		const stockcount = await stockService.isStockIdExist({ product_id: jsonObj.product_id, mrp: jsonObj.mrp });

		if (stockcount === 0) {
			// add entry to stock with new mrp and stock as 0
			// add entry in history table with new mrp and stock as same old stock
			let stockid = await stockService.insertToStock(jsonObj.product_id, jsonObj.mrp, '0', '0');

			let data = await stockService.insertItemHistoryTable(
				jsonObj.center_id,
				'Product',
				jsonObj.product_id,
				'0',
				'0',
				'0',
				'0',
				'PRD',
				`MRP Change - ${jsonObj.mrp}`,
				'0',
				'0', // sale_return_id
				'0', // sale_return_det_id
				'0', // purchase_return_id
				'0', // purchase_return_det_id
			);

			if (!data) {
				throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error adding new product');
			}
		}
		res.status(200).json({
			result: 'success',
		});
	}
});

const getVendorDetails = catchAsync(async (req, res) => {
	const data = await vendorsService.getVendorDetails(req.params.centerid, req.params.vendorid);

	if (!data) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error fetching vendor details');
	}
	return res.status(200).send(data);
});

const getStates = catchAsync(async (req, res) => {
	const data = await adminService.getStates();

	if (!data) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error fetching States data');
	}
	return res.status(200).send(data);
});

const getTimezones = catchAsync(async (req, res) => {
	const data = await adminService.getTimezones();

	if (!data) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error fetching Timezone data');
	}
	return res.status(200).send(data);
});

const updateVendor = catchAsync(async (req, res) => {
	const data = await vendorsService.updateVendor(req.body, req.params.id);

	if (!data) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error while update vendor ');
	}

	return res.status(200).json({
		result: 'success',
	});
});

const updateBrand = catchAsync(async (req, res) => {
	const data = await brandsService.updateBrand(req.body, req.params.id);

	if (!data) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error while update brand ');
	}

	return res.status(200).json({
		result: 'success',
	});
});

const addVendor = catchAsync(async (req, res) => {
	const data = await vendorsService.insertVendor(req.body);

	if (!data) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error adding new vendor');
	}

	if (data.affectedRows === 1) {
		return res.status(200).json({
			result: 'success',
		});
	}
});

const addBrand = catchAsync(async (req, res) => {
	const data = await brandsService.insertBrand(req.body);

	if (!data) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error adding new brand');
	}

	if (data.affectedRows === 1) {
		return res.status(200).json({
			result: 'success',
		});
	}
});

const getCustomerDetails = catchAsync(async (req, res) => {
	const data = await customersService.getCustomerDetails(req.params.centerid, req.params.customerid);

	if (!data) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error fetching customer details');
	}

	return res.status(200).json(data);
});

const addCustomer = catchAsync(async (req, res) => {
	const data = await customersService.insertCustomer(req.body);

	if (!data) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error adding new customer');
	}
	return res.status(200).json({
		result: 'success',
		id: data.id,
	});
});

const updateCustomer = catchAsync(async (req, res) => {
	const data = await customersService.updateCustomer(req.body, req.params.id);

	if (!data) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error while updating customer ');
	}

	return res.status(200).json({
		result: 'success',
	});
});

const getCenterDetails = catchAsync(async (req, res) => {
	const data = await centerService.getCenterDetails(req.params.centerid);

	if (!data) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error fetching center details');
	}

	return res.status(200).json(data);
});

const updateCenter = catchAsync(async (req, res) => {
	const data = await centerService.updateCenter(req);

	if (!data) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error while updating customer ');
	}

	return res.status(200).json({
		result: 'success',
	});
});

const isProductExists = catchAsync(async (req, res) => {
	const data = await productsService.isProductExists(req.params.pcode, req.params.centerid);

	if (!data) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error fetching center details');
	}

	return res.status(200).json(data);
});

const addCustomerShippingAddress = catchAsync(async (req, res) => {
	const data = await customersService.insertCustomerShippingAddress(req.body);

	if (!data) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error adding new customer');
	}
	return res.status(200).json({
		result: 'success',
	});
});

const getCustomerShippingAddress = catchAsync(async (req, res) => {
	const data = await customersService.getCustomerShippingAddress(req.params.customerid);

	if (!data) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error fetching center details');
	}

	return res.status(200).json(data);
});

const updateCustomerShippingAddress = catchAsync(async (req, res) => {
	const data = await customersService.updateCustomerShippingAddress(req.body, req.params.id);

	if (!data) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error while updating customer shipping address ');
	}

	return res.status(200).json(data);
});
//

const inactivateCSA = catchAsync(async (req, res) => {
	const data = await customersService.inactivateCSA(req.body.id);

	if (!data) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error adding new brand');
	}

	if (data === 'UPDATED') {
		return res.status(200).json({ message: 'Address Deleted.' });
	} else {
		return res.status(200).json({ message: 'Address Deletion Failed.' });
	}
});

const getCustomerDiscount = catchAsync(async (req, res) => {
	const data = await customersService.getCustomerDiscount(req.params.centerid, req.params.customerid);

	if (!data) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error fetching center details');
	}

	return res.status(200).json(data);
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
};

// adminRoute.get('/get-shipping-address/:customerid', (req, res) => {
// 	// @from Customer file
// 	getCustomerShippingAddress(`${req.params.customerid}`, (err, rows) => {
// 		if (err) return handleError(new ErrorHandler('500', `/get-shipping-address/:customerid ${req.params.customerid}`, err), res);
// 		return res.json(rows);
// 	});
// });
