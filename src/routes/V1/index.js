const express = require('express');
const config = require('../../config/config');
const docsRoute = require('./docs.route');

const generalRoute = require('./general.route');
const enquiryRoute = require('./enquiry.route');
const saleRoute = require('./sale.route');
const purchaseRoute = require('./purchase.route');
const authRoute = require('./auth.route');

const adminRoute = require('./admin.route');
const stockRoute = require('./stock.route');
const printRoute = require('./print.route');
const accountsRoute = require('./accounts.route');
const receivablesRoute = require('./receivables.route');

const purchaseaccountsRoute = require('./purchaseaccounts.route');
const reportsRoute = require('./reports.route');
const dashboardRoute = require('./dashboard.route');
const returnsRoute = require('./returns.route');
const uploadRoute = require('./upload.route');
const excelRoute = require('./excel.route');

const router = express.Router();

const defaultRoutes = [
	{
		path: '/api',
		route: generalRoute,
	},
	{
		path: '/api/enquiry',
		route: enquiryRoute,
	},
	{
		path: '/api/sale',
		route: saleRoute,
	},
	{
		path: '/api/purchase',
		route: purchaseRoute,
	},
	{
		path: '/api/auth',
		route: authRoute,
	},

	{
		path: '/api/admin',
		route: adminRoute,
	},

	{
		path: '/api/stock',
		route: stockRoute,
	},

	{
		path: '/api/print',
		route: printRoute,
	},

	{
		path: '/api/accounts',
		route: accountsRoute,
	},
	{
		path: '/api/receivables',
		route: receivablesRoute,
	},

	{
		path: '/api/purchaseaccounts',
		route: purchaseaccountsRoute,
	},
	{
		path: '/api/reports',
		route: reportsRoute,
	},
	{
		path: '/api/dashboard',
		route: dashboardRoute,
	},
	{
		path: '/api/returns',
		route: returnsRoute,
	},
	{
		path: '/api/upload',
		route: uploadRoute,
	},
	{
		path: '/api/excel',
		route: excelRoute,
	},
];

const devRoutes = [
	// routes available only in development mode
	{
		path: '/docs',
		route: docsRoute,
	},
];

defaultRoutes.forEach((route) => {
	router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
	devRoutes.forEach((route) => {
		router.use(route.path, route.route);
	});
}

module.exports = router;

// general api routes
