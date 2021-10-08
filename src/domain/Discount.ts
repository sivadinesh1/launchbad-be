import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export interface IDiscount {
	id?: number;
	center_id: number;
	customer_id: number;
	type: string;
	value: number;
	gst_slab: number;
	start_date: Date;
	end_date: Date;
	brand_id: number;

	createdAt?: Date;
	updatedAt?: Date;
	created_by?: number;
	updated_by?: number;
}

export class Discount implements IDiscount {
	@Type(() => Number)
	id: number;

	@Type(() => Number)
	center_id: number;

	@Type(() => Number)
	customer_id: number;

	type: string;

	@Type(() => Number)
	value: number;

	@Type(() => Number)
	gst_slab: number;

	@Type(() => Date)
	start_date: Date;

	@Type(() => Date)
	end_date: Date;

	brand_id: number;

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
		customer_id: number,
		type: string,
		value: number,
		gst_slab: number,
		start_date: Date,
		end_date: Date,
		brand_id: number,

		createdAt: Date,
		updatedAt: Date,
		created_by: number,
		updated_by: number,
	) {
		this.id = id;
		this.center_id = center_id;

		this.customer_id = customer_id;
		this.type = type;
		this.value = value;
		this.gst_slab = gst_slab;
		this.start_date = start_date;
		this.end_date = end_date;
		this.brand_id = brand_id;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
