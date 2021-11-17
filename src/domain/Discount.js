export class Discount {
	id;

	center_id;

	customer_id;

	type;

	value;

	gst_slab;

	start_date;

	end_date;

	brand_id;

	createdAt;

	updatedAt;

	created_by;

	updated_by;

	constructor(
		id,
		center_id,
		customer_id,
		type,
		value,
		gst_slab,
		start_date,
		end_date,
		brand_id,

		createdAt,
		updatedAt,
		created_by,
		updated_by,
	) {
		this.id = id;
		this.center_id = center_id;

		this.customer_id = customer_id;
		this.type = type;
		this.value = value;
		this.gst_slab = gst_slab;
		this.start_date = start_date;
		this.end_date = end_date;
		this.brand_id = brand_id;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
