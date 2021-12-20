const { prisma } = require('../config/prisma');

const {
	currentTimeInTimeZone,
	bigIntToString,
	escapeText,
	promisifyQuery,
} = require('../utils/utils');

// createProduct

const getPaymentMasterRepo = async (payment_id) => {
	const result = await prisma.payment.findUnique({
		where: {
			id: Number(payment_id),
		},
	});
	return bigIntToString(result);
};

const updatePaymentMasterToDelete = async (payment_id, updated_by) => {
	const result = await prisma.payment.update({
		where: {
			id: Number(payment_id),
		},
		data: {
			is_delete: 'Y',
			createdAt: new Date(currentTimeInTimeZone('YYYY-MM-DD HH:mm:SS')),
			created_by: updated_by,
		},
	});

	return bigIntToString(result);
};

module.exports = {
	getPaymentMasterRepo,
	updatePaymentMasterToDelete,
};
