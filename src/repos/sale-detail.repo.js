const { prisma } = require('../config/prisma');

const {
	currentTimeInTimeZone,
	bigIntToString,
	escapeText,
	promisifyQuery,
} = require('../utils/utils');

const addSaleDetail = async (saleDetail, sale_id, updated_by, prisma) => {
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
				created_by: Number(updated_by),
				updated_by: Number(updated_by),
			},
		});

		return bigIntToString(result);
	} catch (error) {
		throw new Error(
			`error :: addSaleDetail sale-detail.repo.js ` + error.message
		);
	}
};

const editSaleDetail = async (saleDetail, sale_id, updated_by, prisma) => {
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
				created_by: Number(updated_by),
				updated_by: Number(updated_by),
			},
		});

		return bigIntToString(result);
	} catch (error) {
		throw new Error(
			`error :: editSaleDetail sale-detail.repo.js ` + error.message
		);
	}
};

const getSaleDetails = async (sale_id) => {
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
		throw new Error(
			`error :: getSaleDetails sale-detail.repo.js ` + error.message
		);
	}
};

module.exports = {
	addSaleDetail,
	editSaleDetail,
	getSaleDetails,
};
