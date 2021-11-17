export class CreditNote {
	id;

	center_id;

	credit_note_no;

	credit_note_total_amount;

	refund_status;

	createdAt;

	updatedAt;

	created_by;

	updated_by;

	constructor(
		id,
		center_id,

		credit_note_no,
		credit_note_total_amount,
		refund_status,
		createdAt,
		updatedAt,
		created_by,
		updated_by,
	) {
		this.id = id;
		this.center_id = center_id;

		this.credit_note_no = credit_note_no;
		this.credit_note_total_amount = credit_note_total_amount;
		this.refund_status = refund_status;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
