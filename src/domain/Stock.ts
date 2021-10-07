import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export interface IStock {
	id?: number;
	center_id: number;
	product_id: number;
	mrp: number;
	available_stock: number;
	corrected_qty?: number;
	open_stock: number;
	is_active: string;

	createdAt?: Date;
	updatedAt?: Date;
	created_by?: number;
	updated_by?: number;
}

export class Stock implements IStock {
	@Type(() => Number)
	id: number;

	@Type(() => Number)
	center_id: number;

	@Type(() => Number)
	product_id: number;

	@Type(() => Number)
	mrp: number;

	@Type(() => Number)
	available_stock: number;

	@Type(() => Number)
	open_stock: number;

	is_active: string;

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
		product_id: number,
		mrp: number,
		available_stock: number,
		open_stock: number,
		is_active: string,

		createdAt: Date,
		updatedAt: Date,
		created_by: number,
		updated_by: number,
	) {
		this.id = id;
		this.center_id = center_id;
		this.product_id = product_id;
		this.mrp = mrp;
		this.available_stock = available_stock;
		this.open_stock = open_stock;
		this.is_active = is_active;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
