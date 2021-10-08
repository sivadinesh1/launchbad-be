import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export interface IBackOrder {
	id?: number;
	center_id: number;
	customer_id: number;
	enquiry_detail_id: number;
	quantity: number;
	reason: string;
	status: string;
	order_date: Date;

	createdAt?: Date;
	updatedAt?: Date;
	created_by?: number;
	updated_by?: number;
}

export class BackOrder implements IBackOrder {
	@Type(() => Number)
	id: number;

	@Type(() => Number)
	center_id: number;

	@Type(() => Number)
	customer_id: number;

	@Type(() => Number)
	enquiry_detail_id: number;
	@Type(() => Number)
	quantity: number;

	reason: string;
	status: string;

	@Type(() => Date)
	order_date: Date;

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
		enquiry_detail_id: number,
		quantity: number,
		reason: string,
		status: string,
		order_date: Date,

		createdAt: Date,
		updatedAt: Date,
		created_by: number,
		updated_by: number,
	) {
		this.id = id;
		this.center_id = center_id;

		this.customer_id = customer_id;
		this.enquiry_detail_id = enquiry_detail_id;
		this.quantity = quantity;
		this.reason = reason;
		this.status = status;
		this.order_date = order_date;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
