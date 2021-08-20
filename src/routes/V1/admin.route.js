const express = require('express');
const adminRoute = express.Router();
//const router = express.Router();

var pool = require('../../config/db');

const { handleError, ErrorHandler } = require('../../config/error');

const {
	insertUser,
	updateUserStatus,
	insertUserRole,
	getUsers,
	getOutstandingBalance,
	isUserExist,
	insertBank,
	updateCenterBankInfo,
	updateBank,
	updateBankDefaults,
} = require('../../services/admin.service');

const {
	updateCustomerDiscount,

	getAllCustomerDefaultDiscounts,
	updateDefaultCustomerDiscount,
	getDiscountsByCustomerByBrand,
	getDiscountsByCustomer,
	insertDiscountsByBrands,
} = require('../../services/customers.service');

const { getPermissions, checkUsernameExists } = require('../../services/auth.service');

const adminController = require('../../controllers/admin.controller');

adminRoute.route('/view-products-count/:centerid').get(adminController.getProductsCount);

adminRoute.route('/view-product-info/:centerid/:productid').get(adminController.getProductInfo);

adminRoute.route('/add-product').post(adminController.addProduct);

adminRoute.route('/update-product').post(adminController.updateProduct);

adminRoute.route('/get-vendor-details/:centerid/:vendorid').get(adminController.getVendorDetails);

adminRoute.route('/get-states').get(adminController.getStates);
adminRoute.route('/get-timezones').get(adminController.getTimezones);

adminRoute.route('/update-vendor/:id').put(adminController.updateVendor);

adminRoute.route('/update-brand/:id').put(adminController.updateBrand);

adminRoute.route('/add-vendor').post(adminController.addVendor);

adminRoute.route('/add-brand').post(adminController.addBrand);

adminRoute.route('/get-customer-details/:centerid/:customerid').get(adminController.getCustomerDetails);

adminRoute.route('/add-customer').post(adminController.addCustomer);

adminRoute.route('/update-customer/:id').put(adminController.updateCustomer);

adminRoute.route('/get-center-details/:centerid').get(adminController.getCenterDetails);

adminRoute.route('/update-center').post(adminController.updateCenter);

adminRoute.route('/prod-exists/:pcode/:centerid').get(adminController.isProductExists);

adminRoute.route('/insert-customer-shipping-address').post(adminController.addCustomerShippingAddress);

adminRoute.route('/get-shipping-address/:customerid').get(adminController.getCustomerShippingAddress);

adminRoute.route('/update-customer-shipping-address/:id').put(adminController.updateCustomerShippingAddress);

adminRoute.route('/inactivate-csa').post(adminController.inactivateCSA);

adminRoute.route('/customer-discount/:centerid/:customerid').get(adminController.getCustomerDiscount);

// get customer discount values
adminRoute.get('/all-customer-default-discounts/:centerid/:customerid', (req, res) => {
	getAllCustomerDefaultDiscounts(`${req.params.centerid}`, `${req.params.customerid}`, (err, rows) => {
		if (err)
			return handleError(
				new ErrorHandler('500', `/all-customer-default-discounts/:centerid ${req.params.centerid} ${req.params.customerid}`, err),
				res,
			);
		return res.json(rows);
	});
});

// get customer discount values BY CUSTOMER
adminRoute.get('/discounts-customer/:centerid/:customerid', (req, res) => {
	getDiscountsByCustomer(`${req.params.centerid}`, `${req.params.customerid}`, (err, rows) => {
		if (err)
			return handleError(
				new ErrorHandler('500', `/discounts-customer/:centerid/:customerid ${req.params.centerid} ${req.params.customerid}`, err),
				res,
			);
		return res.json(rows);
	});
});

// get customer discount values BY CUSTOMER
adminRoute.get('/discounts-customer-brands/:centerid/:customerid', (req, res) => {
	getDiscountsByCustomerByBrand(`${req.params.centerid}`, `${req.params.customerid}`, (err, rows) => {
		if (err)
			return handleError(
				new ErrorHandler('500', `/discounts-customer-brands/:centerid/:customerid ${req.params.centerid} ${req.params.customerid}`, err),
				res,
			);
		return res.json(rows);
	});
});

// get customer discount values BY CUSTOMER
adminRoute.put('/update-default-customer-discount', (req, res) => {
	let jsonObj = req.body;

	updateDefaultCustomerDiscount(jsonObj, (err, rows) => {
		if (err) return handleError(new ErrorHandler('500', `update-default-customer-discount`, err), res);
		return res.json(rows);
	});
});

// get customer discount values
adminRoute.put('/update-customer-discount', (req, res) => {
	let jsonObj = req.body;

	// @from Customer file
	updateCustomerDiscount(jsonObj, (err, rows) => {
		if (err) return handleError(new ErrorHandler('500', '/update-customer-discount', err), res);
		return res.json(rows);
	});
});

adminRoute.post('/add-discounts-brand', (req, res) => {
	let jsonObj = req.body;
	insertDiscountsByBrands(jsonObj, (err, data) => {
		if (err) {
			return handleError(new ErrorHandler('500', '/add-discounts-brand', err), res);
		} else {
			let resdata = JSON.stringify(data);
			return res.status(200).json({
				result: 'success',
			});
		}
	});
});

// Add User,
adminRoute.post('/add-user', async (req, res, next) => {
	let jsonObj = req.body;

	let check = await isUserExist(jsonObj);
	if (check === 'DUP_USERNAME') {
		return res.status(200).json({ message: 'DUP_USERNAME' });
	} else {
		let id = await insertUser(jsonObj);

		if (id !== null || id !== '' || id !== undefined) {
			let userrole = await insertUserRole({
				user_id: id,
				role_id: req.body.role_id,
			});

			return res.status(200).json({ message: 'User Inserted' });
		}
	}
});

// update user status
adminRoute.post('/update-user-status', async (req, res, next) => {
	let jsonObj = req.body;

	let id = await updateUserStatus(jsonObj);

	if (id !== 0) {
		return res.status(200).json({ message: 'User Status Updated.' });
	} else {
		return res.status(200).json({ message: 'User Status Update Failed.' });
	}
});

// get users
adminRoute.get('/get-users/:centerid/:status', async (req, res) => {
	let rows = await getUsers(req.params.centerid, req.params.status);
	return res.status(200).json(rows);
});

adminRoute.get('/usename-exists/:phone/:centerid', async (req, res) => {
	let user = await checkUsernameExists(req.params.phone, req.params.centerid);
	if (user !== null) {
		return res.status(200).json({ message: 'NEW_USER' });
	} else {
		return res.status(200).json({ message: 'ALREADY_EXIST' });
	}
});

// get customer outstanding balance
adminRoute.post('/get-outstanding-balance', async (req, res) => {
	let rows = await getOutstandingBalance(req.body.center_id, req.body.limit);

	return res.status(200).json(rows);
});

adminRoute.post('/add-bank', async (req, res, next) => {
	let insertValues = req.body;

	let id = await insertBank(insertValues);

	if (id === 'success') {
		if (req.body.isdefault) {
			// update center with this bank details, if isdefault is true
			let response = await updateCenterBankInfo(insertValues);

			if (response === 'success') {
				return res.status(200).json({ message: 'success' });
			} else {
				return res.status(200).json({ message: 'Error' });
			}
		} else {
			return res.status(200).json({ message: 'success' });
		}
	} else {
		return res.status(200).json({ message: 'Error' });
	}
});

adminRoute.post('/update-bank', async (req, res, next) => {
	let insertValues = req.body;

	// update BANK DEFAULT to N if default enabled
	if (req.body.isdefault) {
		let updateDefaults = await updateBankDefaults(insertValues.center_id);
	}

	// update bank details
	let id = await updateBank(insertValues);

	if (id === 'success') {
		if (req.body.isdefault) {
			// if default enabled, update center table
			let response = await updateCenterBankInfo(insertValues);

			if (response === 'success') {
				return res.status(200).json({ message: 'success' });
			} else {
				return res.status(200).json({ message: 'Error' });
			}
		} else {
			return res.status(200).json({ message: 'success' });
		}
	} else {
		return res.status(200).json({ message: 'Error' });
	}
});

module.exports = adminRoute;
