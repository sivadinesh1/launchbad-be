import prisma from '../config/prisma';
import { SaleDetail, ISaleDetail } from '../domain/SaleDetail';

const { currentTimeInTimeZone, bigIntToString, escapeText, promisifyQuery } = require('../utils/utils');

class SaleDetailRepo {
	// createProduct

	public async addSaleDetail(saleDetail: ISaleDetail, sale_id: number, prisma: any) {
		try {
			const result = await prisma.sale_detail.create({
				data: {
					center_id: saleDetail.center_id,

					cgs_t: saleDetail.cgs_t,

					disc_percent: saleDetail.disc_percent,

					disc_value: saleDetail.disc_value,
					igs_t: saleDetail.igs_t,
					mrp: saleDetail.mrp,
					product_id: saleDetail.product_id,
					hsn_code: saleDetail.hsn_code,
					quantity: saleDetail.quantity,

					sale_id: Number(sale_id),
					sgs_t: saleDetail.sgs_t,
					stock_id: saleDetail.stock_id,

					tax: saleDetail.tax,
					// old_value: saleDetail.old_val,
					after_tax_value: saleDetail.after_tax_value,
					total_value: saleDetail.total_value,
					unit_price: saleDetail.unit_price,
					created_by: saleDetail.updated_by,
					updated_by: saleDetail.updated_by,
				},
			});

			return bigIntToString(result);
		} catch (error) {
			console.log('error :: addSale sale.repo.ts ' + error);
			throw error;
		}
	}

	public async editSaleDetail(saleDetail: ISaleDetail, sale_id: number, prisma: any) {
		try {
			const result = await prisma.sale_detail.update({
				where: {
					id: Number(saleDetail.id),
				},
				data: {
					center_id: saleDetail.center_id,

					cgs_t: saleDetail.cgs_t,

					disc_percent: saleDetail.disc_percent,

					disc_value: saleDetail.disc_value,
					igs_t: saleDetail.igs_t,
					mrp: saleDetail.mrp,
					product_id: saleDetail.product_id,
					quantity: saleDetail.quantity,

					sale_id: Number(sale_id),
					sgs_t: saleDetail.sgs_t,
					stock_id: saleDetail.stock_id,

					tax: saleDetail.tax,
					// old_value: saleDetail.old_val,
					after_tax_value: saleDetail.after_tax_value,
					total_value: saleDetail.total_value,
					unit_price: saleDetail.unit_price,
					created_by: saleDetail.updated_by,
					updated_by: saleDetail.updated_by,
				},
			});

			return bigIntToString(result);
		} catch (error) {
			console.log('error :: addSale sale.repo.ts ' + error);
			throw error;
		}
	}

	public async getSaleDetails(sale_id: number) {
		try {
			const result = await prisma.sale_detail.findMany({
				where: {
					sale_id: Number(sale_id),
				},
				include: {
					product: true,
					stock: true,
				},
			});
			return bigIntToString(result);
		} catch (error) {
			console.log('error :: addSale sale.repo.ts ' + error);
			throw error;
		}
	}
}

export default new SaleDetailRepo();
