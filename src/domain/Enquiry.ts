import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export interface IEnquiry {
	id?: number;
	center_id: number;
	enquiry_id: number;
	product_id: number;
	product_code: string;
	stock_id: number;
	ask_quantity: number;
	give_quantity: number;
	notes: string;
	status: string;
	processed: string;

	createdAt?: Date;
	updatedAt?: Date;
	created_by?: number;
	updated_by?: number;
}

export class Enquiry implements IEnquiry {
	@Type(() => Number)
	id: number;

	@Type(() => Number)
	center_id: number;

	enquiry_id: number;
	product_id: number;
	product_code: string;
	stock_id: number;
	ask_quantity: number;
	give_quantity: number;
	notes: string;
	status: string;
	processed: string;

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

		enquiry_id: number,
		product_id: number,
		product_code: string,
		stock_id: number,
		ask_quantity: number,
		give_quantity: number,
		notes: string,
		status: string,
		processed: string,

		createdAt: Date,
		updatedAt: Date,
		created_by: number,
		updated_by: number,
	) {
		this.id = id;
		this.center_id = center_id;

		this.enquiry_id = enquiry_id;
		this.product_id = product_id;
		this.product_code = product_code;
		this.stock_id = stock_id;
		this.ask_quantity = ask_quantity;
		this.give_quantity = give_quantity;
		this.notes = notes;
		this.status = status;
		this.processed = processed;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
