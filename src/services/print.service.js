var pool = require('../config/db');

const { handleError, ErrorHandler } = require('../config/error');

const { toTimeZone, currentTimeInTimeZone, promisifyQuery } = require('../utils/utils');

const { createInvoice } = require('./createInvoice.service');
const { createEstimate } = require('./createEstimate.service');

const { getSalesMaster, getSalesDetails } = require('./sales.service');
const { getCenterDetails } = require('./center.service');

const { getCustomerDetails } = require('./customers.service');
const { getSaleReturnDetails } = require('./returns.service');

const invoicePDF = async (requestBody, res) => {
	let sale_id = requestBody.sale_id;
	let print_type = requestBody.print_type;
	let print_ship_to = requestBody.print_ship_to;

	// using saleid get SALE MASTER & SALE DETAILS
	let saleMaster = await getSalesMaster(sale_id);
	let saleDetails = await getSalesDetails(sale_id);

	// get CUSTOMER & CENTER DETAILS
	let customerDetails = await getCustomerDetails(saleMaster[0].center_id, saleMaster[0].customer_id);
	let centerDetails = await getCenterDetails(saleMaster[0].center_id);

	// once all the data received, now populate invoice

	createInvoice(
		saleMaster,
		saleDetails,
		customerDetails,
		centerDetails,

		'invoice.pdf',
		res,
		print_type,
		print_ship_to,
	);
};

const estimatePDF = async (requestBody, res) => {
	let sale_id = requestBody.sale_id;
	let print_type = requestBody.print_type;

	// using saleid get SALE MASTER & SALE DETAILS
	let saleMaster = await getSalesMaster(sale_id);
	let saleDetails = await getSalesDetails(sale_id);

	// get CUSTOMER & CENTER DETAILS
	let customerDetails = await getCustomerDetails(saleMaster[0].center_id, saleMaster[0].customer_id);
	let centerDetails = await getCenterDetails(saleMaster[0].center_id);

	// once all the data received, now populate invoice

	createEstimate(
		saleMaster,
		saleDetails,
		customerDetails,
		centerDetails,

		'estimate.pdf',
		res,
		print_type,
	);
};

const creditNotePDF = async (requestBody, res) => {
	let center_id = requestBody.center_id;
	let sale_return_id = requestBody.sale_return_id;
	let sale_id = requestBody.sale_id;
	let credit_note_no = requestBody.credit_note_no;

	// using saleid get SALE MASTER & SALE DETAILS
	let saleMaster = await getSalesMaster(sale_id);

	let saleReturnDetails = await getSaleReturnDetails(center_id, sale_return_id, res);

	// get CUSTOMER & CENTER DETAILS
	let customerDetails = await getCustomerDetails(saleMaster[0].center_id, saleMaster[0].customer_id);
	let centerDetails = await getCenterDetails(saleMaster[0].center_id);

	// once all the data received, now populate invoice

	createCreditNote(
		saleMaster,
		saleReturnDetails,
		customerDetails,
		centerDetails,

		'saleReturnInvoice.pdf',
		credit_note_no,
		res,
	);
};

module.exports = {
	invoicePDF,
	estimatePDF,
	creditNotePDF,
};
