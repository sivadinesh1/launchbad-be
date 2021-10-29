import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export class Purchase {
	id;

	center_id;

	vendor_id;

	invoice_no;

	invoice_date;
	lr_no;

	lr_date;

	received_date;
	purchase_type;
	order_no;

	order_date;

	total_quantity;

	no_of_items;

	after_tax_value;

	cgs_t;

	sgs_t;

	igs_t;

	total_value;

	transport_charges;

	unloading_charges;

	misc_charges;

	net_total;

	no_of_boxes;
	status;
	stock_inwards_date_time;

	round_off;

	revision;

	createdAt;

	updatedAt;

	created_by;

	updated_by;

	constructor(
		id,
		center_id,

		vendor_id,
		invoice_no,
		invoice_date,
		lr_no,
		lr_date,
		received_date,
		purchase_type,
		order_no,
		order_date,
		total_quantity,
		no_of_items,
		after_tax_value,
		cgs_t,
		sgs_t,
		igs_t,
		total_value,
		transport_charges,
		unloading_charges,
		misc_charges,
		net_total,
		no_of_boxes,
		status,
		stock_inwards_date_time,
		round_off,
		revision,

		createdAt,
		updatedAt,
		created_by,
		updated_by,
	) {
		this.id = id;
		this.center_id = center_id;

		this.vendor_id = vendor_id;
		this.invoice_no = invoice_no;
		this.invoice_date = invoice_date;
		this.lr_no = lr_no;
		this.lr_date = lr_date;
		this.received_date = received_date;
		this.purchase_type = purchase_type;
		this.order_no = order_no;
		this.order_date = order_date;
		this.total_quantity = total_quantity;
		this.no_of_items = no_of_items;
		this.after_tax_value = after_tax_value;
		this.cgs_t = cgs_t;
		this.sgs_t = sgs_t;
		this.igs_t = igs_t;
		this.total_value = total_value;
		this.transport_charges = transport_charges;
		this.unloading_charges = unloading_charges;
		this.misc_charges = misc_charges;
		this.net_total = net_total;
		this.no_of_boxes = no_of_boxes;
		this.status = status;
		this.stock_inwards_date_time = stock_inwards_date_time;
		this.round_off = round_off;
		this.revision = revision;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
