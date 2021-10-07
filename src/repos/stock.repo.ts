import prisma from '../config/prisma';
import { IStock } from '../domain/Stock';
import { IStockRepo } from '../interfaces/stock.interface';
import { StockMap } from '../mappers/stock.mapper';

const { currentTimeInTimeZone, bigIntToString, escapeText, promisifyQuery } = require('../utils/utils');

class StockRepo implements IStockRepo {
	// createstock

	public async addStock(stock: IStock) {
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
			console.log('error :: stock.repo.ts ' + error);
			throw error;
		}
	}

	public async updateStock(stock: IStock) {
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

			console.log('dinesh *2* ' + JSON.stringify(result));

			return result;
		} catch (error) {
			console.log('error :: stock.repo.ts ' + error);
			throw error;
		}
	}
}

export default new StockRepo();

// const correctStock = async (product_id, mrp, stock_qty) => {
// 	let query = `update stock set available_stock =  '${stock_qty}' where product_id = '${product_id}' and mrp = '${mrp}' `;

// 	let data = promisifyQuery(query);
// 	return 'updated';
// };
