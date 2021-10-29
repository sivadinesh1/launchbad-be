const { prisma } = require('../config/prisma');

const { currentTimeInTimeZone, bigIntToString, escapeText, promisifyQuery } = require('../utils/utils');

const addSaleLedgerEntry = async (ledger, prisma) => {
	console.log('dinesh ::: ' + JSON.stringify(ledger));
	try {
		const result = await prisma.ledger.create({
			data: {
				center_id: Number(ledger.center_id),
				customer_id: Number(ledger.customer_id),
				invoice_ref_id: Number(ledger.invoice_ref_id),
				payment_ref_id: Number(ledger.payment_ref_id),

				ledger_detail: ledger.ledger_detail,
				ledger_date: ledger.ledger_date,
				credit_amt: Number(ledger.credit_amt),
				debit_amt: Number(ledger.debit_amt),
				balance_amt: Number(ledger.balance_amt),
				created_by: Number(ledger.created_by),
				updated_by: Number(ledger.updated_by),
			},
		});

		return bigIntToString(result);
	} catch (error) {
		console.log('error :: sale-ledger.repo.js: addSaleLedgerEntry ' + error);
		throw error;
	}
};

const getCustomerBalance = async (customer_id, center_id, prisma) => {
	console.log('dinesh :::LLD ' + customer_id + ' ' + center_id);
	const result = await prisma.ledger.findMany({
		select: {
			balance_amt: true,
		},
		where: {
			customer_id: Number(customer_id),
			center_id: Number(center_id),
		},

		orderBy: {
			id: 'desc',
		},
		take: 1,
	});

	return result.length === 0 ? 0 : result[0].balance_amt;
};

const getCreditAmtForInvoiceReversal = async (customer_id, center_id, invoice_ref_id, prisma) => {
	console.log('dinesh :::LL ' + customer_id + ' ' + center_id + ' ' + invoice_ref_id);
	try {
		const result = await prisma.ledger.findMany({
			select: {
				credit_amt: true,
			},
			where: {
				customer_id: Number(customer_id),
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
		console.log('error :: sale-ledger.repo.js getCreditAmtForInvoiceReversal: ' + error);
		throw error;
	}
};

const updateSaleLedgerCustomerChange = async (center_id, invoice_ref_id, old_customer_id, prisma) => {
	try {
		const result = await prisma.ledger.delete({
			where: {
				center_id: center_id,
				customer_id: old_customer_id,
				invoice_ref_id: invoice_ref_id,
			},
		});

		return bigIntToString(result);
	} catch (error) {
		console.log('error :: sale-ledger.repo.js updateSaleLedgerCustomerChange: ' + error);
		throw error;
	}
};

module.exports = {
	addSaleLedgerEntry,
	getCustomerBalance,
	getCreditAmtForInvoiceReversal,
	updateSaleLedgerCustomerChange,
};
