export class SaleReturnDetail {
	id;

	center_id;

	sale_return_id;

	sale_id;

	sale_detail_id;

	exchange_id;

	return_quantity;

	received_quantity;
	reason;

	disc_percent;

	tax;

	mrp;

	igs_t;

	cgs_t;

	sgs_t;

	orig_sold_qty;

	after_tax_value;

	total_value;
	hsn_code;
	unit;

	createdAt;

	updatedAt;

	created_by;

	updated_by;

	constructor(
		id,
		center_id,

		sale_return_id,
		sale_id,
		sale_detail_id,
		exchange_id,
		return_quantity,
		received_quantity,
		reason,
		disc_percent,
		tax,
		mrp,
		igs_t,
		cgs_t,
		sgs_t,
		orig_sold_qty,
		after_tax_value,
		total_value,
		hsn_code,
		unit,

		createdAt,
		updatedAt,
		created_by,
		updated_by,
	) {
		this.id = id;
		this.center_id = center_id;

		this.sale_return_id = sale_return_id;
		this.sale_id = sale_id;
		this.sale_detail_id = sale_detail_id;
		this.exchange_id = exchange_id;
		this.return_quantity = return_quantity;
		this.received_quantity = received_quantity;
		this.reason = reason;
		this.disc_percent = disc_percent;
		this.tax = tax;
		this.mrp = mrp;
		this.igs_t = igs_t;
		this.cgs_t = cgs_t;
		this.sgs_t = sgs_t;
		this.orig_sold_qty = orig_sold_qty;
		this.after_tax_value = after_tax_value;
		this.total_value = total_value;
		this.hsn_code = hsn_code;
		this.unit = unit;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
