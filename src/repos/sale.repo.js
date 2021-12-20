const { prisma } = require('../config/prisma');

const {
	toTimeZoneFormat,
	currentTimeInTimeZone,
	bigIntToString,
	escapeText,
	promisifyQuery,
} = require('../utils/utils');

const addSaleMaster = async (sale, prisma) => {
	try {
		let formattedDate = toTimeZoneFormat(sale.invoice_date, 'YYYY-MM-DD');

		const result = await prisma.sale.create({
			data: {
				center_id: sale.center_id,
				customer_id: sale.customer_id,
				invoice_no: sale.invoice_no,
				invoice_date: new Date(formattedDate),
				lr_no: sale.lr_no,
				lr_date: sale.lr_date !== null ? sale.lr_date : undefined,
				invoice_type: sale.invoice_type,
				order_no: sale.order_no,
				order_date:
					sale.order_date !== null ? sale.order_date : undefined,
				total_quantity: sale.total_quantity,
				no_of_items: sale.no_of_items,
				after_tax_value: sale.after_tax_value,
				cgs_t: sale.cgs_t,
				sgs_t: sale.sgs_t,
				igs_t: sale.igs_t,
				total_value: sale.total_value,
				transport_charges:
					sale.transport_charges === null
						? undefined
						: sale.transport_charges,
				unloading_charges:
					sale.unloading_charges === null
						? undefined
						: sale.unloading_charges,
				misc_charges:
					sale.misc_charges === null ? undefined : sale.misc_charges,
				net_total: sale.net_total,
				no_of_boxes: sale.no_of_boxes,
				status: sale.status,

				revision: sale.revision,

				stock_issue_ref: sale.stock_issue_ref,
				stock_issue_date_ref:
					sale.stock_issue_date_ref != null
						? sale.stock_issue_date_ref
						: undefined,
				round_off: sale.round_off,
				retail_customer_name: sale.retail_customer_name,
				retail_customer_address: sale.retail_customer_address,
				retail_customer_phone: sale.retail_customer_phone,
				print_count: sale.print_count,
				inv_gen_mode: sale.inv_gen_mode,
				created_by: sale.updated_by,
				updated_by: sale.updated_by,
			},
		});

		return bigIntToString(result);
	} catch (error) {
		console.log('error :: addSale sale.repo.js ' + error);
		throw error;
	}
};

const editSaleMaster = async (sale, prisma) => {
	try {
		const result = await prisma.sale.update({
			where: {
				id: sale.id === null ? undefined : sale.id,
			},
			data: {
				center_id: sale.center_id,
				customer_id: sale.customer_id,
				invoice_no: sale.invoice_no,
				invoice_date: sale.invoice_date,
				lr_no: sale.lr_no,
				lr_date: sale.lr_date !== null ? sale.lr_date : undefined,
				invoice_type: sale.invoice_type,
				order_no: sale.order_no,
				order_date:
					sale.order_date !== null ? sale.order_date : undefined,
				total_quantity: sale.total_quantity,
				no_of_items: sale.no_of_items,
				after_tax_value: sale.after_tax_value,
				cgs_t: sale.cgs_t,
				sgs_t: sale.sgs_t,
				igs_t: sale.igs_t,
				total_value: sale.total_value,
				transport_charges: sale.transport_charges,
				unloading_charges: sale.unloading_charges,
				misc_charges: sale.misc_charges,
				net_total: sale.net_total,
				no_of_boxes: sale.no_of_boxes,
				status: sale.status,

				revision: sale.revision,

				stock_issue_ref: sale.stock_issue_ref,
				stock_issue_date_ref:
					sale.stock_issue_date_ref != null
						? sale.stock_issue_date_ref
						: undefined,
				round_off: sale.round_off,
				retail_customer_name: sale.retail_customer_name,
				retail_customer_address: sale.retail_customer_address,
				retail_customer_phone: sale.retail_customer_phone,
				print_count: sale.print_count,
				inv_gen_mode: sale.inv_gen_mode,
				created_by: sale.updated_by,
				updated_by: sale.updated_by,
			},
		});

		return bigIntToString(result);
	} catch (error) {
		console.log('error :: brand.repo.js ' + error);
		throw error;
	}
};

const updateSalePaymentStatus = async (sale_id, status) => {
	try {
		const result = await prisma.sale.update({
			where: {
				id: sale_id,
			},
			data: {
				payment_status: status,
			},
		});
	} catch (error) {
		console.log('error :: sale.repo.js updateSalePaymentStatus: ' + error);
		throw error;
	}
};

module.exports = {
	addSaleMaster,
	editSaleMaster,
	updateSalePaymentStatus,
};
