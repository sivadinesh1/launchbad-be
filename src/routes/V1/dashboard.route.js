const express = require('express');
const router = express.Router();

const mysql = require('mysql');
const moment = require('moment');
const logger = require('../../config/logger');

const { handleError, ErrorHandler } = require('../../config/error');

const { auth } = require('../../middleware/auth');
const dashboardController = require('../../controllers/dashboard.controller');

router.route('/inquiry-summary').post(auth('getUsers'), dashboardController.getInquirySummary);

router.route('/sales-summary').post(auth('getUsers'), dashboardController.getSalesSummary);

router.route('/purchase-summary').post(auth('getUsers'), dashboardController.getPurchaseSummary);

router.route('/sales-total').post(auth('getUsers'), dashboardController.getSaleTotal);

router.route('/center-summary').post(auth('getUsers'), dashboardController.getCenterSummary);

router.route('/center-receivables-summary').post(auth('getUsers'), dashboardController.getReceivablesOutstanding);

router.route('/payments-customers').post(auth('getUsers'), dashboardController.getPaymentsByCustomers);

router.route('/get-top-clients').post(auth('getUsers'), dashboardController.topClients);

module.exports = router;

//  ~ Daily summary

// SELECT
//  YEAR(STR_TO_DATE(s.invoice_date,'%d-%m-%Y')) AS `year`,
//  MONTHNAME(STR_TO_DATE(s.invoice_date,'%d-%m-%Y')) AS `month`,
//  SUM(s.net_total) AS `subtotal`,
//  count(*) AS orders,
//  s.invoice_date
// FROM sale s
// WHERE
// STR_TO_DATE(s.invoice_date,'%d-%m-%Y') between
// str_to_date('01-09-2020', '%d-%m-%YYYY') and
// str_to_date('01-10-2020', '%d-%m-%YYYY')
// GROUP BY YEAR(STR_TO_DATE(s.invoice_date,'%d-%m-%Y')), MONTH(STR_TO_DATE(s.invoice_date,'%d-%m-%y')), s.invoice_date

//  ~ Monthly summary

// SELECT DATE_FORMAT(STR_TO_DATE(s.invoice_date,'%d-%m-%Y'), "%b-%Y") AS Month, IFNULL(SUM(s.net_total), 0)
// FROM sale s
// WHERE
// STR_TO_DATE(s.invoice_date,'%d-%m-%Y') between
// str_to_date('01-05-2020', '%d-%m-%YYYY') and
// str_to_date('01-10-2020', '%d-%m-%YYYY')
// GROUP BY DATE_FORMAT(STR_TO_DATE(s.invoice_date,'%d-%m-%Y'), "%b-%Y")

// https://stackoverflow.com/questions/27600863/mysql-monthly-sale-of-last-12-months-including-months-with-no-sale
// https://stackoverflow.com/questions/49514715/pulling-data-for-each-month-sql-even-if-there-is-no-data
