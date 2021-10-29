import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export class FinancialYear {
	id;

	center_id;

	financial_year;
	start_date;
	end_date;
	draft_inv_seq;
	inv_seq;
	stock_issue_seq;
	payment_seq;
	vendor_payment_seq;
	sale_return_seq;
	cr_note_seq;

	createdAt;

	updatedAt;

	created_by;

	updated_by;

	constructor(
		id,
		center_id,

		financial_year,
		start_date,
		end_date,
		draft_inv_seq,
		inv_seq,
		stock_issue_seq,
		payment_seq,
		vendor_payment_seq,
		sale_return_seq,
		cr_note_seq,

		createdAt,
		updatedAt,
		created_by,
		updated_by,
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
