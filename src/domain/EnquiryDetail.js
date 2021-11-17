export class EnquiryDetail {
	id;

	center_id;

	enquiry_id;
	product_id;
	product_code;
	stock_id;
	ask_quantity;
	give_quantity;
	notes;
	status;
	processed;

	createdAt;

	updatedAt;

	created_by;

	updated_by;

	constructor(
		id,
		center_id,

		enquiry_id,
		product_id,
		product_code,
		stock_id,
		ask_quantity,
		give_quantity,
		notes,
		status,
		processed,

		createdAt,
		updatedAt,
		created_by,
		updated_by,
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
