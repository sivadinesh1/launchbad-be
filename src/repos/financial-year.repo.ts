// import prisma from '../config/prisma';
import { FinancialYear, IFinancialYear } from '../domain/FinancialYear';

const { currentTimeInTimeZone, bigIntToString, escapeText, promisifyQuery } = require('../utils/utils');

class FinancialYearRepo {
	// createProduct

	public async updateInvoiceSequence(center_id: number, prisma: any) {
		const result = await prisma.financial_year.updateMany({
			where: {
				center_id: Number(center_id),
				start_date: {
					lt: new Date(),
				},
				end_date: {
					gt: new Date(),
				},
			},
			data: {
				inv_seq: {
					increment: 1,
				},
			},
		});
		console.log('dinesh :: ' + JSON.stringify(result));
		return bigIntToString(result);
	}
}
export default new FinancialYearRepo();
