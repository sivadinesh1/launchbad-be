const express = require('express');
const router = express.Router();
const axios = require('axios');

const generalController = require('../../controllers/general.controller');

router.route('/search-product-information').post(generalController.searchProductInformation);

router.route('/search-product').post(generalController.searchProduct);
router.route('/search-customer').post(generalController.searchCustomer);

router.route('/search-vendor').post(generalController.searchVendors);

router.route('/search-brand').post(generalController.searchBrand);

router.route('/inventory/all').post(generalController.getAllInventory);

router.route('/all-clients').post(generalController.getAllClients);

router.route('/all-active-vendors/:centerid').get(generalController.getAllActiveVendors);

router.route('/all-active-brands/:centerid/:status').get(generalController.getAllActiveBrands);

router.route('/vendor-exists/:name/:center_id').get(generalController.isVendorExists);

router.route('/customer-exists/:name/:centerid').get(generalController.isCustomerExists);

router.route('/brand-exists/:name/:center_id').get(generalController.isBrandExists);
router.route('/brand-delete/:id').get(generalController.deleteBrand);

router.route('/enquiry-delete/:id').get(generalController.deleteEnquiry);

router.route('/vendor-delete/:id').get(generalController.deleteVendor);

router.route('/brands-missing-discounts/:centerid/:status/:customerid').get(generalController.getBrandsMissingDiscountsByCustomer);

router.route('/all-active-customers/:centerid').get(generalController.getAllActiveCustomersByCenter);

router.route('/add-parts-details-enquiry').post(generalController.addPartsDetailsEnquiry);

router.route('/get-enquiry/:enquiryid').get(generalController.getEnquiryById);

router.route('/get-customer-details/:enquiryid').get(generalController.getCustomerDetailsById);

router.route('/update-taxrate').post(generalController.updateTaxRate);

router.route('/all-pymt-modes/:center_id/:status').get(generalController.getAllPaymentModes);

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
			},
		)
		.then((res) => {
			console.log(res.data);
		})
		.catch((error) => {
			console.error(error);
		});
});
