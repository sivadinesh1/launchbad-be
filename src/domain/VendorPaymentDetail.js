export class VendorPaymentDetail {
	id;

	center_id;

	vendor_payment_ref_id;
	purchase_ref_id;
	applied_amount;

	createdAt;

	updatedAt;

	created_by;

	updated_by;

	constructor(
		id,
		center_id,

		vendor_payment_ref_id,
		purchase_ref_id,
		applied_amount,

		createdAt,
		updatedAt,
		created_by,
		updated_by,
	) {
		this.id = id;
		this.center_id = center_id;

		this.vendor_payment_ref_id = vendor_payment_ref_id;
		this.purchase_ref_id = purchase_ref_id;
		this.applied_amount = applied_amount;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
