export class Stock {
	id;

	center_id;

	product_id;

	mrp;

	available_stock;

	open_stock;

	is_active;

	createdAt;

	updatedAt;

	created_by;

	updated_by;

	constructor(
		id,
		center_id,
		product_id,
		mrp,
		available_stock,
		open_stock,
		is_active,

		createdAt,
		updatedAt,
		created_by,
		updated_by,
	) {
		this.id = id;
		this.center_id = center_id;
		this.product_id = product_id;
		this.mrp = mrp;
		this.available_stock = available_stock;
		this.open_stock = open_stock;
		this.is_active = is_active;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
