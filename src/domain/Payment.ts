import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export interface IPayment {
	id?: number;
	center_id: number;

	payment_no: string;
	customer_id: number;
	payment_now_amt: number;
	advance_amt_used: number;
	payment_date: Date;
	payment_mode_ref_id: string;
	bank_ref: string;
	payment_ref: string;
	is_cancelled: string;
	cancelled_date: Date;
	last_updated: Date;
	bank_id: number;
	bank_name: string;

	createdAt?: Date;
	updatedAt?: Date;
	created_by?: number;
	updated_by?: number;
}

export class Payment implements IPayment {
	@Type(() => Number)
	id: number;

	@Type(() => Number)
	center_id: number;

	payment_no: string;

	@Type(() => Number)
	customer_id: number;

	@Type(() => Number)
	payment_now_amt: number;

	@Type(() => Number)
	advance_amt_used: number;
	payment_date: Date;
	payment_mode_ref_id: string;
	bank_ref: string;
	payment_ref: string;
	is_cancelled: string;
	cancelled_date: Date;
	last_updated: Date;

	@Type(() => Number)
	bank_id: number;
	bank_name: string;

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

		payment_no: string,
		customer_id: number,
		payment_now_amt: number,
		advance_amt_used: number,
		payment_date: Date,
		payment_mode_ref_id: string,
		bank_ref: string,
		payment_ref: string,
		is_cancelled: string,
		cancelled_date: Date,
		last_updated: Date,
		bank_id: number,
		bank_name: string,

		createdAt: Date,
		updatedAt: Date,
		created_by: number,
		updated_by: number,
	) {
		this.id = id;
		this.center_id = center_id;

		this.payment_no = payment_no;
		this.customer_id = customer_id;
		this.payment_now_amt = payment_now_amt;
		this.advance_amt_used = advance_amt_used;
		this.payment_date = payment_date;
		this.payment_mode_ref_id = payment_mode_ref_id;
		this.bank_ref = bank_ref;
		this.payment_ref = payment_ref;
		this.is_cancelled = is_cancelled;
		this.cancelled_date = cancelled_date;
		this.last_updated = last_updated;
		this.bank_id = bank_id;
		this.bank_name = bank_name;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
