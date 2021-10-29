const { prisma } = require('../config/prisma');

const { BrandRepo } = require('../repos/brand.repo');

const { currentTimeInTimeZone, bigIntToString } = require('../utils/utils');

async function insertBrand() {
	return BrandRepo.addBrand(brand);
}

async function updateBrand() {
	return BrandRepo.updateBrand(brand);
}

async function getAllBrands(center_id, status) {
	return BrandRepo.getAllBrands(center_id, status);
}

async function isBrandExists(center_id, brand_name) {
	return BrandRepo.isBrandExists(+center_id, brand_name);
}

async function deleteBrand(id) {
	return BrandRepo.deleteBrand(id);
}

async function getBrandsMissingDiscountsByCustomer(center_id, status, customer_id) {
	return BrandRepo.getBrandsMissingDiscountsByCustomer(center_id, status, customer_id);
}

async function getSearchBrands(center_id, search_text) {
	return BrandRepo.getSearchBrands(center_id, search_text);
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
