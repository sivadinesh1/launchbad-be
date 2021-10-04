import { IProduct } from '../domain/Product';

var pool = require('../config/db');

const { handleError, ErrorHandler } = require('../config/error');
const { toTimeZone, toTimeZoneFormat, currentTimeInTimeZone, escapeText, promisifyQuery } = require('../utils/utils');

const { insertItemHistoryTable, insertToStock } = require('./stock.service');
const { plainToClass } = require('class-transformer');
const { Product } = require('../domain/Product');
import 'reflect-metadata';

import ProductRepo from '../repos/product.repo';

export async function insertProduct(product: IProduct) {
	return ProductRepo.addProduct(product);
}

export async function updateProduct(product: IProduct) {
	return ProductRepo.updateProduct(product);
}

export async function searchProduct(center_id: number, product_search_text: string) {
	return ProductRepo.searchProduct(center_id, product_search_text);
}

// const updateProduct = (updateValues: any, res: any) => {
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

const isProductExists = async (pcode: any, center_id: any) => {
	let query = `
	select * from product p where 
 	p.product_code = '${pcode}' and center_id = ${center_id}  `;

	return promisifyQuery(query);
};

module.exports = {
	insertProduct,
	updateProduct,
	isProductExists,
	searchProduct,
};
