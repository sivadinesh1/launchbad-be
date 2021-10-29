import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export class PurchaseDetail {
	id;

	center_id;

	purchase_id;
	product_id;
	stock_id;
	quantity;
	purchase_price;
	mrp;

	batch_date;
	tax;
	igs_t;
	cgs_t;
	sgs_t;
	after_tax_value;
	total_value;

	createdAt;

	updatedAt;

	created_by;

	updated_by;

	constructor(
		id,
		center_id,

		purchase_id,
		product_id,
		stock_id,
		quantity,
		purchase_price,
		mrp,
		batch_date,
		tax,
		igs_t,
		cgs_t,
		sgs_t,
		after_tax_value,
		total_value,

		createdAt,
		updatedAt,
		created_by,
		updated_by,
	) {
		this.id = id;
		this.center_id = center_id;

		this.purchase_id = purchase_id;
		this.product_id = product_id;
		this.stock_id = stock_id;
		this.quantity = quantity;
		this.purchase_price = purchase_price;
		this.mrp = mrp;
		this.batch_date = batch_date;
		this.tax = tax;
		this.igs_t = igs_t;
		this.cgs_t = cgs_t;
		this.sgs_t = sgs_t;
		this.after_tax_value = after_tax_value;
		this.total_value = total_value;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
