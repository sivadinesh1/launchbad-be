export class Payment {
	id;

	center_id;

	payment_no;

	customer_id;

	payment_now_amt;

	advance_amt_used;
	payment_date;
	payment_mode_ref_id;
	bank_ref;
	payment_ref;
	is_cancelled;
	cancelled_date;
	last_updated;

	bank_id;
	bank_name;

	createdAt;

	updatedAt;

	created_by;

	updated_by;

	constructor(
		id,
		center_id,

		payment_no,
		customer_id,
		payment_now_amt,
		advance_amt_used,
		payment_date,
		payment_mode_ref_id,
		bank_ref,
		payment_ref,
		is_cancelled,
		cancelled_date,
		last_updated,
		bank_id,
		bank_name,

		createdAt,
		updatedAt,
		created_by,
		updated_by,
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
