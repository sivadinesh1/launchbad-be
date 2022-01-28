const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');

const enquiryController = require('../../controllers/enquiry.controller');

router
	.route('/draft-enquiry')
	.post(auth('getUsers'), enquiryController.draftEnquiry);

router
	.route('/move-to-sale')
	.post(auth('getUsers'), enquiryController.moveToSale);
router
	.route('/update-giveqty-enquiry-details')
	.post(auth('getUsers'), enquiryController.updateGiveqtyEnquiryDetails);
router
	.route('/update-customer/:id/:enqid')
	.get(auth('getUsers'), enquiryController.updateCustomerEnquiry);

router
	.route('/update-status-enquiry-details')
	.post(auth('getUsers'), enquiryController.update_statusEnquiryDetails);
router
	.route('/update-enquiry-details')
	.post(auth('getUsers'), enquiryController.updateEnquiryDetails);

router
	.route('/insert-enquiry-details')
	.post(auth('getUsers'), enquiryController.insertEnquiryDetails);

router
	.route('/add-more-enquiry-details')
	.post(auth('getUsers'), enquiryController.addMoreEnquiryDetails);

router
	.route('/open-enquiries/:status')
	.get(auth('getUsers'), enquiryController.openEnquiries);

router
	.route('/get-enquiry-details/:enqid')
	.get(auth('getUsers'), enquiryController.getEnquiryDetails);

router
	.route('/get-enquiry-master/:enqid')
	.get(auth('getUsers'), enquiryController.getEnquiryMaster);

router
	.route('/get-customer-data/:enqid')
	.get(auth('getUsers'), enquiryController.getCustomerData);

router
	.route('/get-enquired-product-data')
	.get(auth('getUsers'), enquiryController.getEnquiredProductData);

router
	.route('/back-order')
	.get(auth('getUsers'), enquiryController.getBackOrder);

router
	.route('/search-enquiries')
	.post(auth('getUsers'), enquiryController.searchEnquiries);

router
	.route('/delete-enquiry-details')
	.post(auth('getUsers'), enquiryController.deleteEnquiryDetails);

module.exports = router;
