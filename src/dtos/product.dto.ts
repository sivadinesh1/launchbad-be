export interface ProductDTO {
	id?: number;
	center_id: number;
	brand_id: number;
	product_code: string;
	product_description: string;
	uom?: string;
	packet_size: number;
	hsn_code: string;
	current_stock: string;
	unit_price: string;
	mrp: string;
	purchase_price: string;
	sales_price: string;
	rack_info: string;
	location?: string;
	max_discount?: string;
	alternate_code?: string;
	tax_rate?: number;
	minimum_quantity?: number;
	item_discount?: string;
	reorder_quantity?: number;
	average_purchase_price?: number;
	average_sale_price?: number;
	margin?: number;
	createdAt?: Date;
	updatedAt?: Date;
	created_by?: number;
	updated_by?: number;
}