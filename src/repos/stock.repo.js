const { prisma } = require('../config/prisma');

const {
	currentTimeInTimeZone,
	bigIntToString,
	escapeText,
	promisifyQuery,
} = require('../utils/utils');

// const insertToStock = async (product_id, mrp, available_stock, open_stock) => {
// 	let upDate = new Date();
// 	let todayYYMMDD = toTimeZoneFormat(upDate, 'YYYY-MM-DD');

// 	let query = `
// 	insert into stock (product_id, mrp, available_stock, open_stock, updatedAt)
// 	values ('${product_id}', '${mrp}', '${available_stock}', '${open_stock}' , '${todayYYMMDD}')`;

// 	return promisifyQuery(query);
// };

const insertToStock = async (stock, prisma) => {
	try {
		const result = await prisma.stock.create({
			data: {
				product_id: Number(stock.product_id),
				mrp: stock.mrp,
				available_stock: stock.available_stock,
				open_stock: stock.open_stock,
				center_id: stock.center_id,

				createdAt: currentTimeInTimeZone(),
				updatedAt: currentTimeInTimeZone(),
				created_by: stock.user_id,
				updated_by: stock.user_id,
			},
		});

		return bigIntToString(result);
	} catch (error) {
		throw new Error(
			`error :: insertToStock stock.repo.js ` + error.message
		);
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
				available_stock: Number(stock.corrected_stock),
				updated_by: stock.created_by,
			},
		});

		return result;
	} catch (error) {
		throw new Error(
			`error :: stockCorrection stock.repo.js ` + error.message
		);
	}
};

// let query = `update stock set is_active = 'N' where product_id = ${product_id} and mrp = ${mrp}`;

const deleteProductFromStockTable = async (
	product_id,
	mrp,
	is_active,
	user_id
) => {
	try {
		const result = await prisma.stock.updateMany({
			where: {
				product_id: Number(product_id),
				mrp: mrp,
			},

			data: {
				is_active: is_active,
				updated_by: user_id,
			},
		});

		return result;
	} catch (error) {
		throw new Error(
			`error :: deleteProductFromStockTable stock.repo.js ` +
				error.message
		);
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
		throw new Error(`error :: stockMinus stock.repo.js ` + error.message);
	}
};

const stockAdd = async (qty_to_update, stock_pk, updated_by, prisma) => {
	try {
		const result = await prisma.stock.updateMany({
			where: {
				id: Number(stock_pk),
			},

			data: {
				available_stock: {
					increment: qty_to_update,
				},
				updated_by: updated_by,
			},
		});

		return result.count;
	} catch (error) {
		throw new Error(`error :: stockAdd stock.repo.js ` + error.message);
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
		throw new Error(`error :: getStockId stock.repo.js ` + error.message);
	}
};

module.exports = {
	insertToStock,
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
