import prisma from '../config/prisma';
import { FinancialYear, IFinancialYear } from '../domain/FinancialYear';

const { formatSequenceNumber, currentTimeInTimeZone, bigIntToString, escapeText, promisifyQuery } = require('../utils/utils');

class FinancialYearRepo {
	// createProduct

	public async getFinancialYearRow(center_id: number, prisma: any) {
		const recordToUpdate = await prisma.financial_year.findMany({
			where: {
				center_id: Number(center_id),
				start_date: {
					lt: new Date(),
				},
				end_date: {
					gt: new Date(),
				},
			},
		});

		return recordToUpdate[0].id;
	}

	public async getNextInvSequenceNo(center_id: number) {
		let rowId = await this.getFinancialYearRow(center_id, prisma); // get the row id

		const result = await prisma.financial_year.findUnique({
			where: {
				id: Number(rowId),
			},
			select: {
				inv_seq: true,
			},
		});

		console.log('object::dinesh: ' + result?.inv_seq);

		let nextInvNo = formatSequenceNumber((Number(result?.inv_seq) + 1).toString());

		return nextInvNo;
	}

	public async getNextStockIssueSequenceNo(center_id: number) {
		let rowId = await this.getFinancialYearRow(center_id, prisma); // get the row id

		const result = await prisma.financial_year.findUnique({
			where: {
				id: Number(rowId),
			},
			select: {
				stock_issue_seq: true,
			},
		});

		let nextInvNo = formatSequenceNumber((Number(result?.stock_issue_seq) + 1).toString(), 'SI-');

		return nextInvNo;
	}

	public async updateInvoiceSequence(center_id: number, prisma: any) {
		let rowId = await this.getFinancialYearRow(center_id, prisma); // get the row id

		const result = await prisma.financial_year.update({
			where: {
				id: Number(rowId),
			},
			data: {
				inv_seq: {
					increment: 1,
				},
			},
		});

		return bigIntToString(result);
	}

	public async updateDraftInvoiceSequenceGenerator(center_id: number, prisma: any) {
		let rowId = await this.getFinancialYearRow(center_id, prisma); // get the row id

		const result = await prisma.financial_year.updateMany({
			where: {
				center_id: Number(rowId),
				start_date: {
					lt: new Date(),
				},
				end_date: {
					gt: new Date(),
				},
			},
			data: {
				draft_inv_seq: {
					increment: 1,
				},
			},
		});

		return bigIntToString(result);
	}

	public async updateStockIssueSequenceGenerator(center_id: number, prisma: any) {
		let rowId = await this.getFinancialYearRow(center_id, prisma); // get the row id
		const result = await prisma.financial_year.update({
			where: {
				center_id: Number(rowId),
				start_date: {
					lt: new Date(),
				},
				end_date: {
					gt: new Date(),
				},
			},
			data: {
				stock_issue_seq: {
					increment: 1,
				},
			},
		});

		return bigIntToString(result);
	}
}

export default new FinancialYearRepo();

// const user = await prisma.user.findFirst({
//   where: {
//     OR: [{ username }, { email }],
//   },
// });
