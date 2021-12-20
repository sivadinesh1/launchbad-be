const { prisma } = require('../config/prisma');

const {
	currentTimeInTimeZone,
	bigIntToString,
	escapeText,
	promisifyQuery,
} = require('../utils/utils');

// createProduct

const getPaymentDetails = async (payment_ref_id) => {
	const result = await prisma.payment_detail.findMany({
		where: {
			payment_ref_id: Number(payment_ref_id),
		},
		include: {
			payment: true,
		},
	});
	return bigIntToString(result);
};

const updatePaymentDetailToDelete = async (payment_id, updated_by, prisma) => {
	try {
		const result = await prisma.payment_detail.update({
			where: {
				id: Number(payment_id),
			},
			data: {
				is_delete: 'Y',
				updatedAt: new Date(
					currentTimeInTimeZone('YYYY-MM-DD HH:mm:SS')
				),
				updated_by: updated_by,
			},
		});

		return bigIntToString(result);
	} catch (error) {
		console.log(
			'error :: payment-detail.repo.js: updatePaymentDetailToDelete ' +
				error
		);
		throw error;
	}
};

const paymentTillDate = async (sale_ref_id) => {
	const result = await prisma.payment_detail.aggregate({
		where: {
			sale_ref_id: sale_ref_id,
			is_delete: 'N',
		},
		_sum: {
			applied_amount: true,
		},
	});

	return result._sum.available_stock;
};

module.exports = {
	getPaymentDetails,
	updatePaymentDetailToDelete,
	paymentTillDate,
};
