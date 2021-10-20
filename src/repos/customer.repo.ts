import prisma from '../config/prisma';
import { Customer, ICustomer } from '../domain/Customer';

const { currentTimeInTimeZone, bigIntToString, escapeText, promisifyQuery } = require('../utils/utils');

class CustomerRepo {
	// createProduct

	public async updateCustomerBalanceAmt(customer_id: number, balance_amt: number, prisma: any) {
		const result = await prisma.customer.update({
			where: {
				id: Number(customer_id),
			},
			data: {
				balance_amt: balance_amt,
			},
		});

		return bigIntToString(result);
	}
}

export default new CustomerRepo();
