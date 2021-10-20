import prisma from '../config/prisma';
import { Enquiry, IEnquiry } from '../domain/Enquiry';

const { currentTimeInTimeZone, bigIntToString, escapeText, promisifyQuery } = require('../utils/utils');

class EnquiryRepo {
	// createProduct

	// let uenqsaleidqry = `update enquiry set
	// estatus = 'E',
	// sale_id = '${newPK}'
	// where
	// id =  '${enqref}' `;

	public async updateEnquiryAfterSale(enq_id: number, saleId: number, prisma: any) {
		const result = await prisma.enquiry.update({
			where: {
				id: Number(enq_id),
			},
			data: {
				e_status: 'E',
				sale_id: Number(saleId),
			},
		});

		return bigIntToString(result);
	}
}

export default new EnquiryRepo();
