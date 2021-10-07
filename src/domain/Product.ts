import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export interface IProduct {
	id?: number;
	center_id: number;
	brand_id: number;
	product_type: string;
	product_code: string;
	product_description: string;
	uom?: string;
	packet_size: number;
	hsn_code: string;
	current_stock: number;
	unit_price: string;
	mrp: string;
	purchase_price: number;
	sales_price: number;
	rack_info: string;
	location?: string;
	max_discount?: number;
	alternate_code?: string;
	tax_rate?: number;
	minimum_quantity?: number;
	item_discount?: number;
	reorder_quantity?: number;
	average_purchase_price?: number;
	average_sale_price?: number;
	margin?: number;
	createdAt?: Date;
	updatedAt?: Date;
	created_by?: number;
	updated_by?: number;

	getProductName: () => string;
}

export class Product implements IProduct {
	@Type(() => Number)
	id: number;

	@Type(() => Number)
	center_id: number;
	@Type(() => Number)
	brand_id: number;
	product_type: string;
	product_code: string;
	product_description: string;
	uom: string;
	@Type(() => Number)
	packet_size: number;
	hsn_code: string;
	@Type(() => Number)
	current_stock: number;
	unit_price: string;
	mrp: string;
	@Type(() => Number)
	purchase_price: number;
	@Type(() => Number)
	sales_price: number;
	rack_info: string;
	location: string;
	@Type(() => Number)
	max_discount: number;
	alternate_code: string;
	@Type(() => Number)
	tax_rate: number;
	@Type(() => Number)
	minimum_quantity: number;
	@Type(() => Number)
	item_discount: number;
	@Type(() => Number)
	reorder_quantity: number;
	@Type(() => Number)
	average_purchase_price: number;
	@Type(() => Number)
	average_sale_price: number;
	@Type(() => Number)
	margin: number;
	@Type(() => Date)
	createdAt: Date;
	@Type(() => Date)
	updatedAt: Date;
	@Type(() => Number)
	created_by: number;
	@Type(() => Number)
	updated_by: number;

	constructor(
		id: number,
		center_id: number,
		brand_id: number,
		product_type: string,
		product_code: string,
		product_description: string,
		uom: string,
		packet_size: number,
		hsn_code: string,
		current_stock: number,
		unit_price: string,
		mrp: string,
		purchase_price: number,
		sales_price: number,
		rack_info: string,
		location: string,
		max_discount: number,
		alternate_code: string,
		tax_rate: number,
		minimum_quantity: number,
		item_discount: number,
		reorder_quantity: number,
		average_purchase_price: number,
		average_sale_price: number,
		margin: number,
		createdAt: Date,
		updatedAt: Date,
		created_by: number,
		updated_by: number,
	) {
		this.id = id;
		this.center_id = center_id;
		this.brand_id = brand_id;
		this.product_type = product_type;
		this.product_code = product_code;
		this.product_description = product_description;
		this.uom = uom;
		this.packet_size = packet_size;
		this.hsn_code = hsn_code;
		this.current_stock = current_stock;
		this.unit_price = unit_price;
		this.mrp = mrp;
		this.purchase_price = purchase_price;
		this.sales_price = sales_price;
		this.rack_info = rack_info;
		this.location = location;
		this.max_discount = max_discount;
		this.alternate_code = alternate_code;
		this.tax_rate = tax_rate;
		this.minimum_quantity = minimum_quantity;
		this.item_discount = item_discount;
		this.reorder_quantity = reorder_quantity;
		this.average_purchase_price = average_purchase_price;
		this.average_sale_price = average_sale_price;
		this.margin = margin;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
	getProductName() {
		return this.product_description;
	}
}
