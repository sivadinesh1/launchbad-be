export class Enquiry {
	id;

	center_id;

	customer_id;
	enquiry_date;
	e_status;
	remarks;
	sale_id;
	processed_date;

	createdAt;

	updatedAt;

	created_by;

	updated_by;

	constructor(
		id,
		center_id,

		customer_id,
		enquiry_date,
		e_status,
		remarks,
		sale_id,
		processed_date,

		createdAt,
		updatedAt,
		created_by,
		updated_by,
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
