export interface StockDTO {
	id: number;
	center_id: number;
	product_id: number;
	mrp: number;
	available_stock: number;
	open_stock: number;
	is_active: string;

	createdAt: Date;
	updatedAt: Date;
	created_by: number;
	updated_by: number;
}
