const { prisma } = require('../config/prisma');

const { currentTimeInTimeZone, bigIntToString, escapeText, promisifyQuery } = require('../utils/utils');

// let uenqsaleidqry = `update enquiry set
// estatus = 'E',
// sale_id = '${newPK}'
// where
// id =  '${enqref}' `;

const updateEnquiryAfterSaleasync = async (enq_id, saleId, prisma) => {
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
};

module.exports = {
	updateEnquiryAfterSaleasync,
};
