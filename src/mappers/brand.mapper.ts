import { Brand } from '../domain/Brand';
import { BrandDTO } from '../dtos/brand.dto';

export class BrandMap {
	public static toDTO(brand: any): BrandDTO {
		return {
			id: brand.id,
			center_id: brand.center_id,
			brand_name: brand.brand_name,
			is_active: brand.is_active,

			createdAt: brand.createdAt,
			updatedAt: brand.updatedAt,
			created_by: brand.created_by,
			updated_by: brand.updated_by,
		};
	}
}
