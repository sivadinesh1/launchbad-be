export class PaymentDetail {
	id;

	center_id;

	payment_ref_id;

	sale_ref_id;

	applied_amount;

	sale_return_ref_id;

	createdAt;

	updatedAt;

	created_by;

	updated_by;

	constructor(
		id,
		center_id,

		payment_ref_id,
		sale_ref_id,

		applied_amount,
		sale_return_ref_id,

		createdAt,
		updatedAt,
		created_by,
		updated_by,
	) {
		this.id = id;
		this.center_id = center_id;

		this.payment_ref_id = payment_ref_id;
		this.sale_ref_id = sale_ref_id;

		this.applied_amount = applied_amount;
		this.sale_return_ref_id = sale_return_ref_id;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
