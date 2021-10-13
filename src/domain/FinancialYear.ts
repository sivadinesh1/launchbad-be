import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export interface IFinancialYear {
	id?: number;
	center_id: number;
	financial_year: string;
	start_date: Date;
	end_date: Date;
	draft_inv_seq: number;
	inv_seq: number;
	stock_issue_seq: number;
	payment_seq: number;
	vendor_payment_seq: number;
	sale_return_seq: number;
	cr_note_seq: number;

	createdAt?: Date;
	updatedAt?: Date;
	created_by?: number;
	updated_by?: number;
}

export class FinancialYear implements IFinancialYear {
	@Type(() => Number)
	id: number;

	@Type(() => Number)
	center_id: number;

	financial_year: string;
	start_date: Date;
	end_date: Date;
	draft_inv_seq: number;
	inv_seq: number;
	stock_issue_seq: number;
	payment_seq: number;
	vendor_payment_seq: number;
	sale_return_seq: number;
	cr_note_seq: number;

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

		financial_year: string,
		start_date: Date,
		end_date: Date,
		draft_inv_seq: number,
		inv_seq: number,
		stock_issue_seq: number,
		payment_seq: number,
		vendor_payment_seq: number,
		sale_return_seq: number,
		cr_note_seq: number,

		createdAt: Date,
		updatedAt: Date,
		created_by: number,
		updated_by: number,
	) {
		this.id = id;
		this.center_id = center_id;

		this.financial_year = financial_year;
		this.start_date = start_date;
		this.end_date = end_date;
		this.draft_inv_seq = draft_inv_seq;
		this.inv_seq = inv_seq;
		this.stock_issue_seq = stock_issue_seq;
		this.payment_seq = payment_seq;
		this.vendor_payment_seq = vendor_payment_seq;
		this.sale_return_seq = sale_return_seq;
		this.cr_note_seq = cr_note_seq;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
