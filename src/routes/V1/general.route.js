const express = require('express');
const router = express.Router();
const axios = require('axios');

const { auth } = require('../../middleware/auth.js');

const generalController = require('../../controllers/general.controller');

router
	.route('/search-product-information')
	.post(auth('getUsers'), generalController.searchProductInformation);

router
	.route('/search-product')
	.post(auth('getUsers'), generalController.searchProduct);
router
	.route('/search-customer')
	.post(auth('getUsers'), generalController.searchCustomer);

router
	.route('/search-vendor')
	.post(auth('getUsers'), generalController.searchVendors);

router
	.route('/search-brand')
	.post(auth('getUsers'), generalController.searchBrand);

router
	.route('/inventory/all')
	.post(auth('getUsers'), generalController.getAllInventory);

router
	.route('/all-clients')
	.post(auth('getUsers'), generalController.getAllClients);

router
	.route('/all-active-vendors')
	.get(auth('getUsers'), generalController.getAllActiveVendors);

router
	.route('/all-active-vendors')
	.post(auth('getUsers'), generalController.getAllActiveVendorsPost);

router
	.route('/all-active-brands/:status')
	.get(auth('getUsers'), generalController.getAllActiveBrands);

router
	.route('/all-active-brands')
	.post(auth('getUsers'), generalController.getAllActiveBrandsPost);

router
	.route('/vendor-exists/:name')
	.get(auth('getUsers'), generalController.isVendorExists);

router
	.route('/customer-exists/:name')
	.get(auth('getUsers'), generalController.isCustomerExists);

router
	.route('/brand-exists/:name')
	.get(auth('getUsers'), generalController.isBrandExists);
router
	.route('/brand-delete/:id')
	.get(auth('getUsers'), generalController.deleteBrand);

router
	.route('/enquiry-delete/:id')
	.get(auth('getUsers'), generalController.deleteEnquiry);

router
	.route('/vendor-delete/:id')
	.get(auth('getUsers'), generalController.deleteVendor);

router
	.route('/brands-missing-discounts/:status/:customer_id')
	.get(
		auth('getUsers'),
		generalController.getBrandsMissingDiscountsByCustomer
	);

router
	.route('/all-active-customers')
	.get(auth('getUsers'), generalController.getAllActiveCustomersByCenter);
router
	.route('/all-active-customers')
	.post(auth('getUsers'), generalController.getAllActiveCustomers);

router
	.route('/add-parts-details-enquiry')
	.post(auth('getUsers'), generalController.addPartsDetailsEnquiry);

router
	.route('/get-enquiry/:enquiry_id')
	.get(auth('getUsers'), generalController.getEnquiryById);

router
	.route('/get-customer-details/:enquiry_id')
	.get(auth('getUsers'), generalController.getCustomerDetailsById);

router
	.route('/update-tax-rate')
	.post(auth('getUsers'), generalController.updateTaxRate);

router
	.route('/all-payment-modes/:status')
	.get(auth('getUsers'), generalController.getAllPaymentModes);

module.exports = router;

// to delete R&D

router.get('/all-meetings', (req, res) => {
	let data = 'dinesh';
	const access_token =
		'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6ImtFTFlKRWRkUmlPMV93bDc2czFEbkEiLCJleHAiOjE2MjEwNjA4OTIsImlhdCI6MTYyMDQ1NjA5M30.KIcNG45pta74WMsdjchQrrmW1Akb-AGT06-HUvrSQx8';

	axios
		.get('https://api.zoom.us/v2/users/sivadinesh@squapl.com/meetings', {
			headers: {
				Authorization: `Bearer ${access_token}`,
			},
		})
		.then((res) => {
			console.log(res.data);
		})
		.catch((error) => {
			console.error(error);
		});
});

router.post('/create-meeting', (req, res) => {
	const url = `https://api.zoom.us/v2/users/sivadinesh@squapl.com/meetings`;

	const access_token =
		'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6ImtFTFlKRWRkUmlPMV93bDc2czFEbkEiLCJleHAiOjE2MjEwNjA4OTIsImlhdCI6MTYyMDQ1NjA5M30.KIcNG45pta74WMsdjchQrrmW1Akb-AGT06-HUvrSQx8';

	axios
		.post(
			url,
			{
				topic: 'Test Meeting',
				start_time: '2021-06-05T18:00:00Z',
				type: 3,
				duration: 20,
				timezone: 'Asia/Calcutta',
				agenda: 'Testing the Url',
			},
			{
				headers: {
					Authorization: `Bearer ${access_token}`,
				},
			}
		)
		.then((res) => {
			console.log(res.data);
		})
		.catch((error) => {
			console.error(error);
		});
});
