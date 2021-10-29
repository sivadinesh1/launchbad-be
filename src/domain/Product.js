class Product {
	id;

	center_id;

	brand_id;
	product_type;
	product_code;
	product_description;
	uom;

	packet_size;
	hsn_code;

	current_stock;
	unit_price;
	mrp;

	purchase_price;

	sales_price;
	rack_info;
	location;

	max_discount;
	alternate_code;

	tax_rate;

	minimum_quantity;

	item_discount;

	reorder_quantity;

	average_purchase_price;

	average_sale_price;

	margin;

	createdAt;

	updatedAt;

	created_by;

	updated_by;

	constructor(
		id,
		center_id,
		brand_id,
		product_type,
		product_code,
		product_description,
		uom,
		packet_size,
		hsn_code,
		current_stock,
		unit_price,
		mrp,
		purchase_price,
		sales_price,
		rack_info,
		location,
		max_discount,
		alternate_code,
		tax_rate,
		minimum_quantity,
		item_discount,
		reorder_quantity,
		average_purchase_price,
		average_sale_price,
		margin,
		createdAt,
		updatedAt,
		created_by,
		updated_by,
	) {
		this.id = id;
		this.center_id = center_id;
		this.brand_id = brand_id;
		this.product_type = product_type;
		this.product_code = product_code;
		this.product_description = product_description;
		this.uom = uom;
		this.packet_size = packet_size;
		this.hsn_code = hsn_code;
		this.current_stock = current_stock;
		this.unit_price = unit_price;
		this.mrp = mrp;
		this.purchase_price = purchase_price;
		this.sales_price = sales_price;
		this.rack_info = rack_info;
		this.location = location;
		this.max_discount = max_discount;
		this.alternate_code = alternate_code;
		this.tax_rate = tax_rate;
		this.minimum_quantity = minimum_quantity;
		this.item_discount = item_discount;
		this.reorder_quantity = reorder_quantity;
		this.average_purchase_price = average_purchase_price;
		this.average_sale_price = average_sale_price;
		this.margin = margin;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
	getProductName() {
		return this.product_description;
	}
}
