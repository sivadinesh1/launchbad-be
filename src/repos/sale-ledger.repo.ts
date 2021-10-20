import prisma from '../config/prisma';
import { Ledger, ILedger } from '../domain/Ledger';

const { currentTimeInTimeZone, bigIntToString, escapeText, promisifyQuery } = require('../utils/utils');

class SaleLedgerRepo {
	public async addSaleLedgerEntry(ledger: ILedger, prisma: any) {
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
			console.log('error :: sale-ledger.repo.ts: addSaleLedgerEntry ' + error);
			throw error;
		}
	}

	public async getCustomerBalance(customer_id: number, center_id: number, prisma: any) {
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

		return bigIntToString(result[0].balance_amt);
	}

	public async getCreditAmtForInvoiceReversal(customer_id: number, center_id: number, invoice_ref_id: number, prisma: any) {
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
			take: 1,
		});

		return bigIntToString(result[0].credit_amt);
	}

	public async updateSaleLedgerCustomerChange(center_id: number, invoice_ref_id: number, old_customer_id: number, prisma: any) {
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
			console.log('error :: sale-ledger.repo.ts updateSaleLedgerCustomerChange: ' + error);
			throw error;
		}
	}
}

export default new SaleLedgerRepo();
