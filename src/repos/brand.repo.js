const { prisma } = require('../config/prisma');

const { currentTimeInTimeZone, bigIntToString, escapeText, promisifyQuery } = require('../utils/utils');

// createProduct

const brandRepoAddBrand = async (brand) => {
	try {
		const result = await prisma.brand.create({
			data: {
				center_id: brand.center_id,
				brand_name: brand.brand_name,
				is_active: brand.is_active,
				createdAt: brand.createdAt,
				created_by: brand.created_by,
			},
		});

		return bigIntToString(result);
	} catch (error) {
		console.log('error :: brand.repo.js ' + error);
		throw error;
	}
};

const brandRepoUpdateBrand = async (brand) => {
	const result = await prisma.brand.update({
		where: {
			id: Number(brand.id),
		},
		data: {
			brand_name: brand.brand_name,
		},
	});

	return bigIntToString(result);
};

const brandRepoGetAllBrands = async (center_id, status) => {
	const result = await prisma.brand.findMany({
		where: {
			center_id: center_id,
			is_active: status,
		},
		orderBy: {
			brand_name: 'asc',
		},
	});
	return bigIntToString(result);
};

const brandRepoGetSearchBrands = async (center_id, search_text) => {
	const filteredBrands = await prisma.brand.findMany({
		where: {
			brand_name: {
				contains: 'search_text',
			},
			center_id: Number(center_id),
		},
		select: {
			id: true,
			center_id: true,
			brand_name: true,
			is_active: true,
		},
	});
	return bigIntToString(filteredBrands);
};

const brandRepoGetBrandsMissingDiscountsByCustomer = async (center_id, status, customer_id) => {
	const distinctBrands = await prisma.discount.findMany({
		distinct: ['brand_id'],
		where: {
			center_id: Number(center_id),

			customer_id: Number(customer_id),
		},
	});

	const allBrands = await this.getAllBrands(center_id, status);

	const missingBrands = allBrands.filter((brand) => {
		return distinctBrands.find((item) => item.brand_id !== brand.id);
	});

	return bigIntToString(missingBrands);
};

const brandRepoDeleteBrand = async (id) => {
	const result = await prisma.brand.update({
		where: {
			id: Number(id),
		},
		data: {
			is_active: 'D',
		},
	});

	return bigIntToString(result);
};

const brandRepoIsBrandExists = async (center_id, brand_name) => {
	let brandCount = await prisma.brand.count({
		where: {
			brand_name: brand_name,
			center_id: Number(center_id),
		},
	});

	return { result: brandCount };
};

module.exports = {
	brandRepoAddBrand,
	brandRepoUpdateBrand,
	brandRepoGetAllBrands,
	brandRepoGetSearchBrands,
	brandRepoGetBrandsMissingDiscountsByCustomer,
	brandRepoDeleteBrand,
	brandRepoIsBrandExists,
};
// export default new BrandRepo();
