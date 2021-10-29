import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export class SaleDetail {
	id;

	center_id;

	sale_id;

	product_id;

	hsn_code;

	stock_id;

	quantity;

	unit_price;
	mrp;

	batch_date;

	tax;

	igs_t;

	cgs_t;

	sgs_t;

	after_tax_value;

	total_value;

	disc_value;

	disc_percent;
	disc_type;
	returned;

	old_val;

	createdAt;

	updatedAt;

	created_by;

	updated_by;

	constructor(
		id,
		center_id,

		sale_id,
		product_id,
		hsn_code,
		stock_id,
		quantity,
		unit_price,
		mrp,
		batch_date,
		tax,
		igs_t,
		cgs_t,
		sgs_t,
		after_tax_value,
		total_value,
		disc_value,
		disc_percent,
		disc_type,
		returned,

		old_val,

		createdAt,
		updatedAt,
		created_by,
		updated_by,
	) {
		this.id = id;
		this.center_id = center_id;

		this.sale_id = sale_id;
		this.product_id = product_id;
		this.hsn_code = hsn_code;
		this.stock_id = stock_id;
		this.quantity = quantity;
		this.unit_price = unit_price;
		this.mrp = mrp;
		this.batch_date = batch_date;
		this.tax = tax;
		this.igs_t = igs_t;
		this.cgs_t = cgs_t;
		this.sgs_t = sgs_t;
		this.after_tax_value = after_tax_value;
		this.total_value = total_value;
		this.disc_value = disc_value;
		this.disc_percent = disc_percent;
		this.disc_type = disc_type;
		this.returned = returned;

		this.old_val = old_val;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
