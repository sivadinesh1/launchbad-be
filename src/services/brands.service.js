const { prisma } = require('../config/prisma');

const { promisifyQuery } = require('../utils/utils');

const {
	brandRepoAddBrand,
	brandRepoUpdateBrand,
	brandRepoGetAllBrands,
	brandRepoGetSearchBrands,
	brandRepoGetBrandsMissingDiscountsByCustomer,
	brandRepoDeleteBrand,
	brandRepoIsBrandExists,
} = require('../repos/brand.repo');

async function insertBrand(brand) {
	return brandRepoAddBrand(brand);
}

async function updateBrand(brand) {
	return brandRepoUpdateBrand(brand);
}

async function getAllBrands(center_id, status) {
	return brandRepoGetAllBrands(center_id, status);
}

const getAllActiveBrandsPost = async (center_id, offset = 0, length = 20) => {
	let query = `select * from brand b
	where 
	b.center_id = '${center_id}' and is_active = 'A' order by b.brand_name`;
	query = query + ` limit ${offset}, ${length} `;

	let result1 = await promisifyQuery(query);

	let result2 = await getAllActiveBrandsPostCountStar(center_id);

	return { full_count: result2[0].full_count, result: result1 };
};

const getAllActiveBrandsPostCountStar = async (center_id) => {
	let query = `select count(*) as full_count
	from brand b
	where 
	b.center_id = '${center_id}' and is_active = 'A' order by b.brand_name`;

	return await promisifyQuery(query);
};

async function isBrandExists(center_id, brand_name) {
	return brandRepoIsBrandExists(+center_id, brand_name);
}

async function deleteBrand(id) {
	return brandRepoDeleteBrand(id);
}

async function getBrandsMissingDiscountsByCustomer(
	center_id,
	status,
	customer_id
) {
	return brandRepoGetBrandsMissingDiscountsByCustomer(
		center_id,
		status,
		customer_id
	);
}

async function getSearchBrands(center_id, search_text) {
	return brandRepoGetSearchBrands(center_id, search_text);
}

module.exports = {
	insertBrand,
	updateBrand,
	getAllBrands,
	getSearchBrands,
	getBrandsMissingDiscountsByCustomer,
	deleteBrand,
	isBrandExists,
	getAllActiveBrandsPost,
};
