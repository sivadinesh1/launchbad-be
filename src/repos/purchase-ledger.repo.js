const { prisma } = require('../config/prisma');

const { currentTimeInTimeZone, bigIntToString, escapeText, promisifyQuery } = require('../utils/utils');

const addPurchaseLedgerEntry = async (purchase_ledger, prisma) => {
	console.log('dinesh purchase_ledger ' + JSON.stringify(purchase_ledger));
	try {
		const result = await prisma.purchase_ledger.create({
			data: {
				center_id: Number(purchase_ledger.center_id),
				vendor_id: Number(purchase_ledger.vendor_id),
				purchase_ref_id: Number(purchase_ledger.purchase_ref_id),
				payment_ref_id: Number(purchase_ledger.payment_ref_id),

				ledger_detail: purchase_ledger.ledger_detail,
				ledger_date: purchase_ledger.ledger_date,
				credit_amt: Number(purchase_ledger.credit_amt),
				debit_amt: Number(purchase_ledger.debit_amt),
				balance_amt: Number(purchase_ledger.balance_amt),
				created_by: Number(purchase_ledger.created_by),
				updated_by: Number(purchase_ledger.updated_by),
			},
		});

		return bigIntToString(result);
	} catch (error) {
		console.log('error :: purchase-ledger.repo.js: addPurchaseLedgerEntry ' + error.message);
		throw error;
	}
};

const getVendorBalance = async (vendor_id, center_id, prisma) => {
	const result = await prisma.purchase_ledger.findMany({
		select: {
			balance_amt: true,
		},
		where: {
			vendor_id: Number(vendor_id),
			center_id: Number(center_id),
		},

		orderBy: {
			id: 'desc',
		},
		take: 1,
	});

	return result.length === 0 ? 0 : result[0].balance_amt;
};

const getCreditAmtForInvoiceReversal = async (vendor_id, center_id, invoice_ref_id, prisma) => {
	try {
		const result = await prisma.purchase_ledger.findMany({
			select: {
				credit_amt: true,
			},
			where: {
				vendor_id: Number(vendor_id),
				center_id: Number(center_id),
				invoice_ref_id: Number(invoice_ref_id),
				ledger_detail: 'Invoice',
			},

			orderBy: {
				id: 'desc',
			},
		});

		console.log('dinesh cc ' + bigIntToString(result));
		return bigIntToString(result[0].credit_amt);
	} catch (error) {
		console.log('error :: purchase-ledger.repo.js getCreditAmtForInvoiceReversal: ' + error);
		throw error;
	}
};

const updatePurchaseLedgerVendorChange = async (center_id, invoice_ref_id, old_vendor_id, prisma) => {
	try {
		const result = await prisma.purchase_ledger.delete({
			where: {
				center_id: center_id,
				vendor_id: old_vendor_id,
				invoice_ref_id: invoice_ref_id,
			},
		});

		return bigIntToString(result);
	} catch (error) {
		console.log('error :: purchase-ledger.repo.js updatePurchaseLedgerVendorChange: ' + error);
		throw error;
	}
};

module.exports = {
	addPurchaseLedgerEntry,
	getVendorBalance,
	getCreditAmtForInvoiceReversal,
	updatePurchaseLedgerVendorChange,
};
