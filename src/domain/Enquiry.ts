import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export interface IEnquiry {
	id?: number;
	center_id: number;

	customer_id: number;
	enquiry_date: Date;
	e_status: string;
	remarks: string;
	sale_id: number;
	processed_date: Date;

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

	customer_id: number;
	enquiry_date: Date;
	e_status: string;
	remarks: string;
	sale_id: number;
	processed_date: Date;

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
		enquiry_date: Date,
		e_status: string,
		remarks: string,
		sale_id: number,
		processed_date: Date,

		createdAt: Date,
		updatedAt: Date,
		created_by: number,
		updated_by: number,
	) {
		this.id = id;
		this.center_id = center_id;

		this.customer_id = customer_id;
		this.enquiry_date = enquiry_date;
		this.e_status = e_status;
		this.remarks = remarks;
		this.sale_id = sale_id;
		this.processed_date = processed_date;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
