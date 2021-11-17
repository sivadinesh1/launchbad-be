const express = require('express');
const router = express.Router();

const { auth } = require('../../middleware/auth');

const adminController = require('../../controllers/admin.controller');

router.route('/view-products-count').get(auth('getUsers'), adminController.getProductsCount);

router.route('/view-product-info/:productid').get(auth('getUsers'), adminController.getProductInfo);

router.route('/add-product').post(auth('getUsers'), adminController.addProduct);

router.route('/update-product').post(auth('getUsers'), adminController.updateProduct);

router.route('/get-vendor-details/:vendorid').get(auth('getUsers'), adminController.getVendorDetails);

router.route('/get-states').get(auth('getUsers'), adminController.getStates);
router.route('/get-timezones').get(auth('getUsers'), adminController.getTimezones);

router.route('/update-vendor').post(auth('getUsers'), adminController.updateVendor);

router.route('/update-brand').post(auth('getUsers'), adminController.updateBrand);

router.route('/add-vendor').post(auth('getUsers'), adminController.addVendor);

router.route('/add-brand').post(auth('getUsers'), adminController.addBrand);

router.route('/get-customer-details/:customer_id').get(auth('getUsers'), adminController.getCustomerDetails);

router.route('/add-customer').post(auth('getUsers'), adminController.addCustomer);

router.route('/update-customer/:id').put(auth('getUsers'), adminController.updateCustomer);

router.route('/get-center-details').get(auth('getUsers'), adminController.getCenterDetails);

router.route('/update-center').post(auth('getUsers'), adminController.updateCenter);

router.route('/prod-exists/:product_code').get(auth('getUsers'), adminController.isProductExists);

router.route('/insert-customer-shipping-address').post(auth('getUsers'), adminController.addCustomerShippingAddress);

router.route('/get-shipping-address/:customer_id').get(auth('getUsers'), adminController.getCustomerShippingAddress);

router.route('/update-customer-shipping-address/:id').put(auth('getUsers'), adminController.updateCustomerShippingAddress);

router.route('/inactivate-csa').post(auth('getUsers'), adminController.inactivateCSA);

router.route('/customer-discount/:customer_id').get(auth('getUsers'), adminController.getCustomerDiscount);

router.route('/all-customer-default-discounts/:customer_id').get(auth('getUsers'), adminController.getAllCustomerDefaultDiscounts);

router.route('/discounts-customer/:customer_id').get(auth('getUsers'), adminController.getDiscountsByCustomer);

router.route('/discounts-customer-brands/:customer_id').get(auth('getUsers'), adminController.getDiscountsByCustomerByBrand);

router.route('/update-default-customer-discount').put(auth('getUsers'), adminController.updateDefaultCustomerDiscount);

router.route('/add-discounts-brand').post(auth('getUsers'), adminController.insertDiscountsByBrands);

router.route('/add-user').post(auth('getUsers'), adminController.addUser);

router.route('/update-user-status').post(auth('getUsers'), adminController.updateUser);

router.route('/get-users/:status').get(auth('getUsers'), adminController.getUsers);

router.route('/usename-exists/:phone').get(auth('getUsers'), adminController.checkUsernameExists);

router.route('/get-outstanding-balance').post(auth('getUsers'), adminController.getOutstandingBalance);

router.route('/add-bank').post(auth('getUsers'), adminController.addBank);

router.route('/update-bank').post(auth('getUsers'), adminController.updateBank);

module.exports = router;
