// refund status - Pending (P), Partially Refunded (PR), Refunded (R)
// receive status - not received (NR) received (R), partially received (PR)
// status - approved (A), closed (C)

const express = require('express');
const router = express.Router();
const returnsController = require('../../controllers/returns.controller');

router.route('/get-sale-returns/:center_id').get(returnsController.getReturns);

router.route('/search-sale-return').post(returnsController.searchSaleReturn);

router.route('/get-sale-return-details/:center_id/:salre_return_id').get(returnsController.getSaleReturnDetails);

router.route('/update-sale-returns-received').post(returnsController.updateSaleReturnsReceived);

router.route('/show-receive-button/:center_id/:sale_return_id').get(returnsController.showReceiveButton);

router.route('/add-sale-return').post(returnsController.addSaleReturn);

module.exports = router;
