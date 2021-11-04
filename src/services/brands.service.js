const { prisma } = require('../config/prisma');

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

async function isBrandExists(center_id, brand_name) {
	return brandRepoIsBrandExists(+center_id, brand_name);
}

async function deleteBrand(id) {
	return brandRepoDeleteBrand(id);
}

async function getBrandsMissingDiscountsByCustomer(center_id, status, customer_id) {
	return brandRepoGetBrandsMissingDiscountsByCustomer(center_id, status, customer_id);
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
};
