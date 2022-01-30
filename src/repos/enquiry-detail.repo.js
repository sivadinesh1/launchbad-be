const { prisma } = require('../config/prisma');

const {
	currentTimeInTimeZone,
	bigIntToString,
	escapeText,
	promisifyQuery,
} = require('../utils/utils');

const AddEnquiryDetail = async (
	enquiry_id,
	center_id,
	product_id,
	ask_quantity,
	product_code,
	notes,
	status,
	user_id,
	prisma
) => {
	try {
		const result = await prisma.enquiry_detail.create({
			data: {
				center_id: Number(center_id),
				enquiry_id: Number(enquiry_id),
				product_id: Number(product_id),
				ask_quantity: Number(ask_quantity),
				product_code: product_code,
				notes: notes,
				status: status,

				createdAt: currentTimeInTimeZone(),
				created_by: Number(user_id),
			},
		});

		return bigIntToString(result);
	} catch (error) {
		throw new Error(
			`error :: AddEnquiryDetail enquiry-detail.repo.js ..` +
				error.message
		);
	}
};

const UpdateEnquiryDetail = async (
	enquiry_detail_id,

	product_id,
	stock_id,
	give_quantity,
	processed,
	status,
	user_id,
	prisma
) => {
	try {
		const result = await prisma.enquiry_detail.update({
			where: {
				id: Number(enquiry_detail_id),
			},
			data: {
				product_id: product_id !== '' ? Number(product_id) : null,
				stock_id: stock_id !== null ? Number(stock_id) : null,
				give_quantity: Number(give_quantity),
				processed: processed,

				status: status,

				updatedAt: currentTimeInTimeZone(),
				updated_by: Number(user_id),
			},
		});

		return bigIntToString(result);
	} catch (error) {
		throw new Error(
			`error :: UpdateEnquiryDetail enquiry-detail.repo.js ..` +
				error.message
		);
	}
};

module.exports = {
	AddEnquiryDetail,
	UpdateEnquiryDetail,
};
