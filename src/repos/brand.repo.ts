import prisma from '../config/prisma';
import { Brand, IBrand } from '../domain/Brand';
import { IBrandRepo } from '../interfaces/brand.interface';
import { BrandMap } from '../mappers/brand.mapper';

const { currentTimeInTimeZone, bigIntToString, escapeText, promisifyQuery } = require('../utils/utils');

class BrandRepo implements IBrandRepo {
	// createProduct

	public async addBrand(brand: IBrand) {
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
			console.log('error :: brand.repo.ts ' + error);
			throw error;
		}
	}

	public async updateBrand(brand: IBrand) {
		const result = await prisma.brand.update({
			where: {
				id: Number(brand.id),
			},
			data: {
				brand_name: brand.brand_name,
			},
		});

		return bigIntToString(result);
	}

	public async getAllBrands(center_id: number, status: string) {
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
	}

	public async getSearchBrands(center_id: any, search_text: any) {
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
	}

	public async getBrandsMissingDiscountsByCustomer(center_id: any, status: any, customer_id: any) {
		const distinctBrands = await prisma.discount.findMany({
			distinct: ['brand_id'],
			where: {
				center_id: Number(center_id),

				customer_id: Number(customer_id),
			},
		});

		const allBrands = await this.getAllBrands(center_id, status);

		const missingBrands = allBrands.filter((brand: any) => {
			return distinctBrands.find((item) => item.brand_id !== brand.id);
		});

		return bigIntToString(missingBrands);
	}

	public async deleteBrand(id: number) {
		const result = await prisma.brand.update({
			where: {
				id: Number(id),
			},
			data: {
				is_active: 'D',
			},
		});

		return bigIntToString(result);
	}

	public async isBrandExists(center_id: number, brand_name: string) {
		let brandCount = await prisma.brand.count({
			where: {
				brand_name: brand_name,
				center_id: Number(center_id),
			},
		});

		return { result: brandCount };
	}
}

export default new BrandRepo();
