const express = require('express');
const router = express.Router();

const enquiryController = require('../../controllers/enquiry.controller');

router.route('/draft-enquiry').post(enquiryController.draftEnquiry);

router.route('/move-to-sale').post(enquiryController.moveToSale);
router.route('/update-giveqty-enquiry-details').post(enquiryController.updateGiveqtyEnquiryDetails);
router.route('/update-customer/:id/:enqid').get(enquiryController.updateCustomerEnquiry);

router.route('/update-status-enquiry-details').post(enquiryController.update_statusEnquiryDetails);
router.route('/update-enquiry-details').post(enquiryController.updateEnquiryDetails);

router.route('/insert-enquiry-details').post(enquiryController.insertEnquiryDetails);

router.route('/add-more-enquiry-details').post(enquiryController.addMoreEnquiryDetails);

router.route('/open-enquiries/:status').get(enquiryController.openEnquiries);

router.route('/get-enquiry-details/:enqid').get(enquiryController.getEnquiryDetails);

router.route('/get-enquiry-master/:enqid').get(enquiryController.getEnquiryMaster);

router.route('/get-customer-data/:enqid').get(enquiryController.getCustomerData);

router.route('/get-enquired-product-data').get(enquiryController.getEnquiredProductData);

router.route('/back-order').get(enquiryController.getBackOrder);

router.route('/search-enquiries').post(enquiryController.searchEnquiries);

router.route('/delete-enquiry-details').post(enquiryController.deleteEnquiryDetails);

module.exports = router;
