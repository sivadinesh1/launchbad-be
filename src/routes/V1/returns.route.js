// refund status - Pending (P), Partially Refunded (PR), Refunded (R)
// receive status - not received (NR) received (R), partially received (PR)
// status - approved (A), closed (C)

const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const returnsController = require('../../controllers/returns.controller');

router.route('/get-sale-returns').get(auth('getUsers'), returnsController.getReturns);

router.route('/search-sale-return').post(auth('getUsers'), returnsController.searchSaleReturn);

router.route('/get-sale-return-details/:salre_return_id').get(auth('getUsers'), returnsController.getSaleReturnDetails);

router.route('/update-sale-returns-received').post(auth('getUsers'), returnsController.updateSaleReturnsReceived);

router.route('/show-receive-button/:sale_return_id').get(auth('getUsers'), returnsController.showReceiveButton);

router.route('/add-sale-return').post(auth('getUsers'), returnsController.addSaleReturn);

module.exports = router;
