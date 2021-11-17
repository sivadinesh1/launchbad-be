export class SaleReturn {
	id;

	center_id;

	sale_id;
	cr_note_id;
	return_date;
	to_return_amount;
	amount_returned;
	to_receive_items;
	received_items;
	receive_status;
	refund_status;
	return_status;
	customer_id;

	createdAt;

	updatedAt;

	created_by;

	updated_by;

	constructor(
		id,
		center_id,

		sale_id,
		cr_note_id,
		return_date,
		to_return_amount,
		amount_returned,
		to_receive_items,
		received_items,
		receive_status,
		refund_status,
		return_status,
		customer_id,

		createdAt,
		updatedAt,
		created_by,
		updated_by,
	) {
		this.id = id;
		this.center_id = center_id;

		this.sale_id = sale_id;
		this.cr_note_id = cr_note_id;
		this.return_date = return_date;
		this.to_return_amount = to_return_amount;
		this.amount_returned = amount_returned;
		this.to_receive_items = to_receive_items;
		this.received_items = received_items;
		this.receive_status = receive_status;
		this.refund_status = refund_status;
		this.return_status = return_status;
		this.customer_id = customer_id;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
