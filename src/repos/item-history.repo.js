const { prisma } = require('../config/prisma');

const {
	currentTimeInTimeZone,
	bigIntToString,
	escapeText,
	promisifyQuery,
} = require('../utils/utils');

const addItemHistory = async (itemHistory, prisma) => {
	try {
		const result = await prisma.item_history.create({
			data: {
				center_id: Number(itemHistory.center_id),
				module: itemHistory.module,
				product_ref_id: Number(itemHistory.product_ref_id),
				purchase_id: Number(itemHistory.purchase_id),
				purchase_det_id: Number(itemHistory.purchase_det_id),
				sale_id: Number(itemHistory.sale_id),
				sale_det_id: Number(itemHistory.sale_det_id),
				action: itemHistory.action,
				action_type: itemHistory.action_type,
				txn_qty: Number(itemHistory.txn_qty),
				stock_level: Number(itemHistory.stock_level),
				txn_date: currentTimeInTimeZone(),
				sale_return_id: Number(itemHistory.sale_return_id),
				sale_return_det_id: Number(itemHistory.sale_return_det_id),
				purchase_return_id: Number(itemHistory.purchase_return_id),
				purchase_return_det_id: Number(
					itemHistory.purchase_return_det_id
				),

				created_by: itemHistory.created_by,
				createdAt: currentTimeInTimeZone(),
			},
		});

		return bigIntToString(result);
	} catch (error) {
		throw new Error(
			`error :: addItemHistory item-history.repo.js ` + error.message
		);
	}
};

const addItemHistoryStandalone = async (itemHistory) => {
	try {
		const result = await prisma.item_history.create({
			data: {
				center_id: Number(itemHistory.center_id),
				module: itemHistory.module,
				product_ref_id: Number(itemHistory.product_ref_id),
				purchase_id: Number(itemHistory.purchase_id),
				purchase_det_id: Number(itemHistory.purchase_det_id),
				sale_id: Number(itemHistory.sale_id),
				sale_det_id: Number(itemHistory.sale_det_id),
				action: itemHistory.action,
				action_type: itemHistory.action_type,
				txn_qty: Number(itemHistory.txn_qty),
				stock_level: Number(itemHistory.stock_level),
				txn_date: itemHistory.txn_date,
				sale_return_id: Number(itemHistory.sale_return_id),
				sale_return_det_id: Number(itemHistory.sale_return_det_id),
				purchase_return_id: Number(itemHistory.purchase_return_id),
				purchase_return_det_id: Number(
					itemHistory.purchase_return_det_id
				),

				created_by: itemHistory.created_by,
				createdAt: currentTimeInTimeZone(),
			},
		});

		return bigIntToString(result);
	} catch (error) {
		throw new Error(
			`error :: addItemHistory item-history.repo.js ` + error.message
		);
	}
};

module.exports = {
	addItemHistory,
	addItemHistoryStandalone,
};
