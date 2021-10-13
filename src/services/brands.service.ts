import prisma from '../config/prisma';
import { IBrand } from '../domain/Brand';

import BrandRepo from '../repos/brand.repo';

const { currentTimeInTimeZone, bigIntToString } = require('../utils/utils');

export async function insertBrand(brand: IBrand) {
	return BrandRepo.addBrand(brand);
}

export async function updateBrand(brand: IBrand) {
	return BrandRepo.updateBrand(brand);
}

export async function getAllBrands(center_id: number, status: string) {
	return BrandRepo.getAllBrands(center_id, status);
}

export async function isBrandExists(center_id: number, brand_name: string) {
	return BrandRepo.isBrandExists(+center_id, brand_name);
}

export async function deleteBrand(id: number) {
	return BrandRepo.deleteBrand(id);
}

export async function getBrandsMissingDiscountsByCustomer(center_id: any, status: any, customer_id: any) {
	return BrandRepo.getBrandsMissingDiscountsByCustomer(center_id, status, customer_id);
}

export async function getSearchBrands(center_id: any, search_text: any) {
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
