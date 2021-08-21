const express = require('express');
const router = express.Router();

const adminController = require('../../controllers/admin.controller');

router.route('/view-products-count/:centerid').get(adminController.getProductsCount);

router.route('/view-product-info/:centerid/:productid').get(adminController.getProductInfo);

router.route('/add-product').post(adminController.addProduct);

router.route('/update-product').post(adminController.updateProduct);

router.route('/get-vendor-details/:centerid/:vendorid').get(adminController.getVendorDetails);

router.route('/get-states').get(adminController.getStates);
router.route('/get-timezones').get(adminController.getTimezones);

router.route('/update-vendor/:id').put(adminController.updateVendor);

router.route('/update-brand/:id').put(adminController.updateBrand);

router.route('/add-vendor').post(adminController.addVendor);

router.route('/add-brand').post(adminController.addBrand);

router.route('/get-customer-details/:centerid/:customerid').get(adminController.getCustomerDetails);

router.route('/add-customer').post(adminController.addCustomer);

router.route('/update-customer/:id').put(adminController.updateCustomer);

router.route('/get-center-details/:centerid').get(adminController.getCenterDetails);

router.route('/update-center').post(adminController.updateCenter);

router.route('/prod-exists/:pcode/:centerid').get(adminController.isProductExists);

router.route('/insert-customer-shipping-address').post(adminController.addCustomerShippingAddress);

router.route('/get-shipping-address/:customerid').get(adminController.getCustomerShippingAddress);

router.route('/update-customer-shipping-address/:id').put(adminController.updateCustomerShippingAddress);

router.route('/inactivate-csa').post(adminController.inactivateCSA);

router.route('/customer-discount/:centerid/:customerid').get(adminController.getCustomerDiscount);

router.route('/all-customer-default-discounts/:centerid/:customerid').get(adminController.getAllCustomerDefaultDiscounts);

router.route('/discounts-customer/:centerid/:customerid').get(adminController.getDiscountsByCustomer);

router.route('/discounts-customer/:centerid/:customerid').get(adminController.getDiscountsByCustomerByBrand);

router.route('/update-default-customer-discount').put(adminController.updateDefaultCustomerDiscount);

router.route('/update-customer-discount').put(adminController.updateCustomerDiscount);

router.route('/add-discounts-brand').post(adminController.insertDiscountsByBrands);

router.route('/add-user').post(adminController.addUser);

router.route('/update-user-status').post(adminController.updateUser);

router.route('/get-users/:centerid/:status').get(adminController.getUsers);

router.route('/usename-exists/:phone/:centerid').get(adminController.checkUsernameExists);

router.route('/get-outstanding-balance').get(adminController.getOutstandingBalance);

router.route('/add-bank').post(adminController.addBank);

router.route('/update-bank').post(adminController.updateBank);

module.exports = router;
