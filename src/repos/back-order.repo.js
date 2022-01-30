const { prisma } = require('../config/prisma');

const {
	currentTimeInTimeZone,
	bigIntToString,
	escapeText,
	promisifyQuery,
} = require('../utils/utils');

const addBackOrder = async (backOrder, center_id, user_id, prisma) => {
	try {
		const result = await prisma.back_order.create({
			data: {
				center_id: Number(center_id),
				customer_id: Number(backOrder.customer_id),
				enquiry_detail_id: Number(backOrder.enquiry_detail_id),
				quantity: Number(backOrder.ask_quantity),
				reason: backOrder.reason,
				status: backOrder.status,
				order_date: currentTimeInTimeZone(),
				createdAt: currentTimeInTimeZone(),
				created_by: Number(user_id),
			},
		});

		return bigIntToString(result);
	} catch (error) {
		console.log('error :: addBackOrder back-order.repo.js ' + error);
		throw error;
	}
};

module.exports = {
	addBackOrder,
};
