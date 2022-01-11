var pool = require('../config/db');

const { handleError, ErrorHandler } = require('../config/error');

const StockRepo = require('./../repos/stock.repo');

const { Product } = require('../domain/Product');

const {
	productRepoAddProduct,
	productRepoUpdateProduct,
	productRepoIsProductExists,
	productRepoSearchProduct,
} = require('../repos/product.repo');

async function insertProduct(product) {
	let result = await productRepoAddProduct(product);

	console.log('dinesh result', result);

	let result1 = await StockRepo.insertToStock(
		result.id,
		product.mrp,
		product.current_stock,
		product.current_stock,
		product.center_id,
		product.created_by
	);

	return { status: 'success' };
}

async function updateProduct(product) {
	return await productRepoUpdateProduct(product);
}

async function searchProduct(center_id, product_search_text, offset, length) {
	return await productRepoSearchProduct(
		center_id,
		product_search_text,
		offset,
		length
	);
}

// const updateProduct = (updateValues, res) => {
// 	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

// 	let escapedDescription = escapeText(updateValues.description);

// 	let query = `
// 			update product set center_id = '${updateValues.center_id}', brand_id = '${updateValues.brand_id}',
// 			product_code = '${updateValues.product_code}', description = '${escapedDescription}',unit = '${updateValues.unit}',
// 			packetsize = '${updateValues.packetsize}', hsncode = '${updateValues.hsncode}',currentstock = '${updateValues.currentstock}',
// 			unit_price = '${updateValues.unit_price}', mrp = '${updateValues.mrp}',purchase_price = '${updateValues.purchase_price}',
// 			salesprice = '${updateValues.salesprice}', rackno = '${updateValues.rackno}',location = '${updateValues.location}',
// 			maxdiscount = '${updateValues.maxdiscount}', alternatecode = '${updateValues.alternatecode}',taxrate = '${updateValues.taxrate}',
// 			minqty = '${updateValues.minqty}', itemdiscount = '${updateValues.itemdiscount}',reorderqty = '${updateValues.reorderqty}',
// 			avgpurprice = '${updateValues.avgpurprice}', avgsaleprice = '${updateValues.avgsaleprice}',margin = '${updateValues.margin}',
// 			rackno = '${updateValues.rackno}', updatedon = '${today}'
// 			where
// 			id = '${updateValues.product_id}'
// 	`;
// 	return promisifyQuery(query);
// };

const isProductExists = async (product_code, center_id) => {
	let result = await productRepoIsProductExists(product_code, center_id);

	if (result === 0) {
		return { status: 'false' };
	} else {
		return { status: 'true' };
	}
};

module.exports = {
	insertProduct,
	updateProduct,
	isProductExists,
	searchProduct,
};
