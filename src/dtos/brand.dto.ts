export interface BrandDTO {
	id?: number;
	center_id: number;
	brand_name: string;
	is_active: string;

	createdAt?: Date;
	updatedAt?: Date;
	created_by?: number;
	updated_by?: number;
}
