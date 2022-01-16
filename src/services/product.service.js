const { prisma } = require('../config/prisma');
// Repos
const ItemHistoryRepo = require('../repos/item-history.repo');
const ProductRepo = require('../repos/product.repo');

async function insertProduct(product) {
	try {
		const response = await prisma.$transaction(async (prisma) => {
			// insert in product table & stock table
			let result = await ProductRepo.addProduct(product, prisma);

			// prepare item history
			let item_history = prepareItemHistory(product, result.id);

			// insert in item history table
			let result1 = await ItemHistoryRepo.addItemHistory(
				item_history,
				prisma
			);

			return { status: 'success' };
		});
		return response;
	} catch (error) {
		throw new Error(
			`error :: insertProduct product.service.js ` + error.message
		);
	}
}

const prepareItemHistory = (product, product_ref_id) => {
	let item_history = {
		center_id: product.center_id,
		module: 'Purchase',
		product_ref_id: product_ref_id,
		purchase_id: 0,
		purchase_det_id: 0,
		sale_id: 0,
		sale_det_id: 0,
		action: `PUR`,
		action_type: `New Product - ${product.mrp}`,
		txn_qty: 0,
		stock_level: product.current_stock,

		sale_return_id: 0,
		sale_return_det_id: 0,
		purchase_return_id: 0,
		purchase_return_det_id: 0,
	};

	return item_history;
};

async function updateProduct(product) {
	return await ProductRepo.updateProduct(product, prisma);
}

async function searchProduct(center_id, search_text, offset, length) {
	return await ProductRepo.searchProduct(
		center_id,
		search_text,
		offset,
		length
	);
}

const isProductExists = async (product_code, center_id) => {
	let result = await ProductRepo.isProductExists(
		product_code,
		center_id,
		prisma
	);

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
