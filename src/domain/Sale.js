import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';


export class Sale  {
	id!;

	center_id;

	customer_id;

	invoice_no;

	invoice_date;
	lr_no;
	lr_date;

	invoice_type;
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
	sale_date_time;

	revision;

	old_customer_id;

	hasCustomerChange;

	stock_issue_ref;
	stock_issue_date_ref;

	round_off;
	retail_customer_name;
	retail_customer_address;
	retail_customer_phone;
	print_count;
	inv_gen_mode;

	enquiry_ref!;

	createdAt;

	updatedAt;

	created_by;

	updated_by;

	constructor(
		id,
		center_id,

		customer_id,
		invoice_no,
		invoice_date,
		lr_no,
		lr_date,

		invoice_type,
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
		sale_date_time,
		revision,
		old_customer_id,
		hasCustomerChange,

		stock_issue_ref,
		stock_issue_date_ref,
		round_off,
		retail_customer_name,
		retail_customer_address,
		retail_customer_phone,
		print_count,
		inv_gen_mode,

		createdAt,
		updatedAt,
		created_by,
		updated_by,
	) {
		this.id = id;
		this.center_id = center_id;

		this.customer_id = customer_id;
		this.invoice_no = invoice_no;
		this.invoice_date = invoice_date;
		this.lr_no = lr_no;
		this.lr_date = lr_date;

		this.invoice_type = invoice_type;
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
		this.sale_date_time = sale_date_time;
		this.revision = revision;
		this.old_customer_id = old_customer_id;
		this.hasCustomerChange = hasCustomerChange;
		this.stock_issue_ref = stock_issue_ref;
		this.stock_issue_date_ref = stock_issue_date_ref;
		this.round_off = round_off;
		this.retail_customer_name = retail_customer_name;
		this.retail_customer_address = retail_customer_address;
		this.retail_customer_phone = retail_customer_phone;
		this.print_count = print_count;
		this.inv_gen_mode = inv_gen_mode;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
