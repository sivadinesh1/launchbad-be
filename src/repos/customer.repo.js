const { prisma } = require('../config/prisma');

const { currentTimeInTimeZone, bigIntToString, escapeText, promisifyQuery } = require('../utils/utils');

const updateCustomerBalanceAmt = async (customer_id, balance_amt, prisma) => {
	const result = await prisma.customer.update({
		where: {
			id: Number(customer_id),
		},
		data: {
			balance_amt: balance_amt,
		},
	});

	return bigIntToString(result);
};

module.exports = {
	updateCustomerBalanceAmt,
};
