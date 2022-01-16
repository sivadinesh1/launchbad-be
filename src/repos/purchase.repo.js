// const {prisma} = require('../config/prisma');

const {
	toTimeZoneFormat,
	currentTimeInTimeZone,
	bigIntToString,
	escapeText,
	promisifyQuery,
} = require('../utils/utils');

const addPurchaseMaster = async (purchase, user_id, prisma) => {
	try {
		const result = await prisma.purchase.create({
			data: {
				center_id: Number(purchase.center_id),
				vendor_id: Number(purchase.vendor_id),
				invoice_no: purchase.invoice_no,
				invoice_date: new Date(purchase.invoice_date),

				lr_date: purchase.lr_date,

				received_date: new Date(purchase.received_date),
				purchase_type: 'GST Invoice',
				order_no: purchase.order_no,
				order_date: purchase.order_date,

				total_quantity: Number(purchase.total_quantity),
				no_of_items: purchase.no_of_items,
				after_tax_value: Number(purchase.after_tax_value),
				cgs_t: Number(purchase.cgs_t),
				sgs_t: Number(purchase.sgs_t),
				igs_t: Number(purchase.igs_t),
				total_value: Number(purchase.total_value),
				transport_charges: Number(purchase.transport_charges),
				unloading_charges: Number(purchase.unloading_charges),
				misc_charges: Number(purchase.misc_charges),
				net_total: Number(purchase.net_total),
				no_of_boxes: Number(purchase.no_of_boxes),
				status: purchase.status,

				stock_inwards_date_time: new Date(
					currentTimeInTimeZone('YYYY-MM-DD HH:mm:SS')
				),
				round_off: purchase.round_off,
				revision: purchase.revision,

				created_by: user_id,
				updated_by: user_id,
				createdAt: currentTimeInTimeZone(),
				updatedAt: currentTimeInTimeZone(),
			},
		});

		return bigIntToString(result);
	} catch (error) {
		throw new Error(
			`error :: addPurchase purchase.repo.js ` + error.message
		);
	}
};

const editPurchaseMaster = async (purchase, user_id, prisma) => {
	try {
		const result = await prisma.purchase.update({
			where: {
				id: Number(purchase.purchase_id),
			},
			data: {
				center_id: Number(purchase.center_id),
				vendor_id: Number(purchase.vendor_id),
				invoice_no: purchase.invoice_no,
				invoice_date: new Date(purchase.invoice_date),

				lr_date: new Date(purchase.lr_date),

				received_date: new Date(purchase.received_date),

				order_no: purchase.order_no,
				order_date: purchase.order_date,

				total_quantity: Number(purchase.total_quantity),
				no_of_items: purchase.no_of_items,
				after_tax_value: Number(purchase.after_tax_value),
				cgs_t: Number(purchase.cgs_t),
				sgs_t: Number(purchase.sgs_t),
				igs_t: Number(purchase.igs_t),
				total_value: Number(purchase.total_value),
				transport_charges: Number(purchase.transport_charges),
				unloading_charges: Number(purchase.unloading_charges),
				misc_charges: Number(purchase.misc_charges),
				net_total: Number(purchase.net_total),
				no_of_boxes: Number(purchase.no_of_boxes),
				status: purchase.status,

				stock_inwards_date_time: new Date(
					currentTimeInTimeZone('YYYY-MM-DD HH:mm:SS')
				),
				round_off: purchase.round_off,
				revision: purchase.revision,

				created_by: user_id,
				updated_by: user_id,
				createdAt: currentTimeInTimeZone(),
				updatedAt: currentTimeInTimeZone(),
			},
		});

		return bigIntToString(result);
	} catch (error) {
		throw new Error(
			`error :: editPurchaseMaster purchase.repo.js ` + error.message
		);
	}
};

module.exports = {
	addPurchaseMaster,
	editPurchaseMaster,
};
