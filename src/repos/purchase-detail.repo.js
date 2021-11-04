// const {prisma} = require('../config/prisma');

const { toTimeZoneFormat, currentTimeInTimeZone, bigIntToString, escapeText, promisifyQuery } = require('../utils/utils');

const addPurchaseDetail = async (purchase, prisma) => {
	try {
		const result = await prisma.purchase_detail.create({
			data: {
				center_id: Number(purchase.center_id),
				purchase_id: Number(purchase.purchase_id),
				product_id: Number(purchase.product_id),

				quantity: Number(purchase.quantity),
				purchase_price: Number(purchase.purchase_price),
				mrp: Number(purchase.mrp),
				batch_date: toTimeZoneFormat(purchase.batch_date),
				tax: Number(purchase.tax),
				igs_t: Number(purchase.igs_t),
				cgs_t: Number(purchase.cgs_t),
				sgs_t: Number(purchase.sgs_t),
				after_tax_value: Number(purchase.after_tax_value),
				total_value: Number(purchase.total_value),
				stock_id: Number(purchase.stock_id),

				created_by: purchase.updated_by,
				updated_by: purchase.updated_by,

				createdAt: currentTimeInTimeZone(),
				updatedAt: currentTimeInTimeZone(),
			},
		});

		return bigIntToString(result);
	} catch (error) {
		console.log('error :: addPurchaseDetail purchase-detail.repo.js ' + error.message);
		throw error;
	}
};

const editPurchaseDetail = async (purchase, prisma) => {
	try {
		const result = await prisma.purchase_detail.update({
			where: {
				id: Number(purchase.id),
			},
			data: {
				center_id: Number(purchase.center_id),
				purchase_id: Number(purchase.purchase_id),
				product_id: Number(purchase.product_id),

				quantity: Number(purchase.quantity),
				purchase_price: Number(purchase.purchase_price),
				mrp: Number(purchase.mrp),
				batch_date: toTimeZoneFormat(purchase.batch_date),
				tax: Number(purchase.tax),
				igs_t: Number(purchase.igs_t),
				cgs_t: Number(purchase.cgs_t),
				sgs_t: Number(purchase.sgs_t),
				after_tax_value: Number(purchase.after_tax_value),
				total_value: Number(purchase.total_value),
				stock_id: Number(purchase.stock_id),

				created_by: purchase.updated_by,
				updated_by: purchase.updated_by,

				createdAt: currentTimeInTimeZone(),
				updatedAt: currentTimeInTimeZone(),
			},
		});

		return bigIntToString(result);
	} catch (error) {
		console.log('error :: addPurchaseDetail purchase-detail.repo.js ' + error.message);
		throw error;
	}
};

module.exports = {
	addPurchaseDetail,
	editPurchaseDetail,
};
