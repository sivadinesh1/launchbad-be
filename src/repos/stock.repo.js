const { prisma } = require('../config/prisma');

const {
	currentTimeInTimeZone,
	bigIntToString,
	escapeText,
	promisifyQuery,
} = require('../utils/utils');

const addStock = async (stock) => {
	try {
		const result = await prisma.stock.create({
			data: {
				center_id: stock.center_id,

				createdAt: stock.createdAt,
				created_by: stock.created_by,
			},
		});

		return bigIntToString(result);
	} catch (error) {
		console.log('error :: stock.repo.js ' + error);
		throw error;
	}
};

const stockCount = async (product_id, prisma) => {
	const result = await prisma.stock.aggregate({
		where: {
			product_id: product_id,
		},
		_sum: {
			available_stock: true,
		},
	});

	return result._sum.available_stock;
};

const stockCorrection = async (stock) => {
	try {
		const result = await prisma.stock.updateMany({
			where: {
				product_id: stock.product_id,
				mrp: stock.mrp,
			},

			data: {
				available_stock: stock.available_stock,
				updated_by: stock.created_by,
			},
		});

		return result;
	} catch (error) {
		console.log('error :: stock.repo.js ' + error);
		throw error;
	}
};

// let query = `update stock set is_active = 'N' where product_id = ${product_id} and mrp = ${mrp}`;

const deleteProductFromStockTable = async (stock) => {
	try {
		const result = await prisma.stock.updateMany({
			where: {
				product_id: stock.product_id,
				mrp: stock.mrp,
			},

			data: {
				is_active: stock.is_active,
				updated_by: stock.created_by,
			},
		});

		return result;
	} catch (error) {
		console.log('error :: stock.repo.js ' + error);
		throw error;
	}
};

const stockMinus = async (qty_to_update, stock_pk, updated_by, prisma) => {
	try {
		const result = await prisma.stock.updateMany({
			where: {
				id: stock_pk,
			},

			data: {
				available_stock: {
					decrement: qty_to_update,
				},
				updated_by: updated_by,
			},
		});

		return result;
	} catch (error) {
		console.log('error :: stock.repo.js : stockMinus:' + error);
		throw error;
	}
};

const stockAdd = async (qty_to_update, stock_pk, updated_by, prisma) => {
	try {
		const result = await prisma.stock.updateMany({
			where: {
				id: stock_pk,
			},

			data: {
				available_stock: {
					increment: qty_to_update,
				},
				updated_by: updated_by,
			},
		});

		return result;
	} catch (error) {
		console.log('error :: stock.repo.js : stockAdd: ' + error);
		throw error;
	}
};

const getStockId = async (product_id, mrp, prisma) => {
	try {
		const result = await prisma.stock.findMany({
			where: {
				product_id: Number(product_id),
				mrp: Number(mrp),
			},

			select: {
				id: true,
			},
		});

		return bigIntToString(result);
	} catch (error) {
		console.log('error :: stock.repo.js : getStockId: ' + error);
		throw error;
	}
};

module.exports = {
	addStock,
	stockCount,
	stockCorrection,
	stockMinus,
	stockAdd,
	getStockId,
	deleteProductFromStockTable,
};

// const correctStock = async (product_id, mrp, stock_qty) => {
// 	let query = `update stock set available_stock =  '${stock_qty}' where product_id = '${product_id}' and mrp = '${mrp}' `;

// 	let data = promisifyQuery(query);
// 	return 'updated';
// };
