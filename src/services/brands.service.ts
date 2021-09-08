import prisma from '../config/prisma';

const { currentTimeInTimeZone, bigIntToString } = require('../utils/utils');

const insertBrand = async (insertValues: any) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');
	const result = await prisma.brand.create({
		data: {
			center_id: Number(insertValues.center_id),
			name: insertValues.name,
			createdon: new Date(today),
			isactive: 'A',
		},
	});
	return result;
};

export const updateBrand = async (updateValues: any, id: any) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

	const result = await prisma.brand.update({
		where: {
			id: Number(id),
		},
		data: {
			center_id: Number(updateValues.center_id),
			name: updateValues.name,
		},
	});

	return bigIntToString(result);
};

export const getAllBrands = async (center_id: any, status: any) => {
	const result = await prisma.brand.findMany({
		where: {
			center_id: Number(center_id),
			isactive: status,
		},
		orderBy: {
			name: 'asc',
		},
	});
	return bigIntToString(result);
};

const getBrandsMissingDiscountsByCustomer = async (center_id: any, status: any, customer_id: any) => {
	const distinctBrands = await prisma.discount.findMany({
		distinct: ['brand_id'],
		where: {
			center_id: Number(center_id),

			customer_id: Number(customer_id),
		},
	});

	const allBrands = await getAllBrands(center_id, status);

	const missingBrands = allBrands.filter((brand: any) => {
		return distinctBrands.find((item) => item.brand_id !== brand.id);
	});

	return bigIntToString(missingBrands);
};

const getSearchBrands = async (centerid: any, searchstr: any) => {
	const filteredBrands = await prisma.brand.findMany({
		where: {
			name: {
				contains: 'searchstr',
			},
		},
		select: {
			id: true,
			center_id: true,
			name: true,
			isactive: true,
		},
	});
	return bigIntToString(filteredBrands);
};

export const isBrandExists = async (center_id: any, name: any) => {
	let brandCount = await prisma.brand.count({
		where: {
			name: name,
			center_id: Number(center_id),
		},
	});

	return { result: brandCount };
};

export const deleteBrand = async (id: any) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

	const result = await prisma.brand.update({
		where: {
			id: Number(id),
		},
		data: {
			isactive: 'D',
		},
	});

	return bigIntToString(result);
};

module.exports = {
	insertBrand,
	updateBrand,
	getAllBrands,
	getSearchBrands,
	getBrandsMissingDiscountsByCustomer,
	deleteBrand,
	isBrandExists,
};
