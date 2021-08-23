var pool = require('../config/db');

const { handleError, ErrorHandler } = require('../config/error');
const { toTimeZone, toTimeZoneFrmt, currentTimeInTimeZone, escapeText, promisifyQuery } = require('../utils/utils');

const { insertItemHistoryTable, insertToStock } = require('../services/stock.service');

const insertProduct = async (insertValues) => {
	let productId = await insertToProduct(insertValues);
	let stockInsertRes = await insertToStock(productId, insertValues.mrp, insertValues.currentstock, insertValues.currentstock);

	let historyAddRes = await insertItemHistoryTable(
		insertValues.center_id,
		'Purchase',
		productId,
		'0',
		'0',
		'0',
		'0',
		'PUR',
		`New Product - ${insertValues.mrp}`,
		insertValues.currentstock,
		'0', // sale_return_id
		'0', // sale_return_det_id
		'0', // purchase_return_id
		'0', // purchase_return_det_id
	);

	return historyAddRes;
};

function insertToProduct(insertValues) {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

	let escapedDescription = escapeText(insertValues.description);

	let query = `insert into 
		product 
			(center_id, brand_id, product_code, description, unit, packetsize, hsncode, currentstock, unit_price, mrp, 
				purchase_price, salesprice, rackno, location, maxdiscount, alternatecode, taxrate, 
				minqty, itemdiscount, reorderqty, avgpurprice, avgsaleprice, margin, createdon)
		VALUES
			( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '${today}' ) `;

	let values = [
		insertValues.center_id,
		insertValues.brand_id,
		insertValues.product_code,
		escapedDescription,
		insertValues.unit,
		insertValues.packetsize,
		insertValues.hsncode,
		insertValues.currentstock,
		insertValues.unit_price,
		insertValues.mrp,
		insertValues.purchase_price,
		insertValues.salesprice,
		insertValues.rackno,
		insertValues.location,
		insertValues.maxdiscount,
		insertValues.alternatecode,
		insertValues.taxrate,
		insertValues.minqty,
		insertValues.itemdiscount,
		insertValues.reorderqty,
		insertValues.avgpurprice,
		insertValues.avgsaleprice,
		insertValues.margin,
	];

	return promisifyQuery(query);
}

const updateProduct = (updateValues, res) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

	let escapedDescription = escapeText(updateValues.description);

	let query = `
			update product set center_id = '${updateValues.center_id}', brand_id = '${updateValues.brand_id}',
			product_code = '${updateValues.product_code}', description = '${escapedDescription}',unit = '${updateValues.unit}',
			packetsize = '${updateValues.packetsize}', hsncode = '${updateValues.hsncode}',currentstock = '${updateValues.currentstock}',
			unit_price = '${updateValues.unit_price}', mrp = '${updateValues.mrp}',purchase_price = '${updateValues.purchase_price}',
			salesprice = '${updateValues.salesprice}', rackno = '${updateValues.rackno}',location = '${updateValues.location}',
			maxdiscount = '${updateValues.maxdiscount}', alternatecode = '${updateValues.alternatecode}',taxrate = '${updateValues.taxrate}',
			minqty = '${updateValues.minqty}', itemdiscount = '${updateValues.itemdiscount}',reorderqty = '${updateValues.reorderqty}',
			avgpurprice = '${updateValues.avgpurprice}', avgsaleprice = '${updateValues.avgsaleprice}',margin = '${updateValues.margin}',
			rackno = '${updateValues.rackno}', updatedon = '${today}'
			where
			id = '${updateValues.product_id}'
	`;
	return promisifyQuery(query);
};

const isProductExists = async (pcode, center_id) => {
	let query = `
	select * from product p where 
 	p.product_code = '${pcode}' and center_id = ${center_id}  `;

	return promisifyQuery(query);
};

module.exports = {
	insertProduct,
	updateProduct,
	isProductExists,
};
