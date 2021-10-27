import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export interface ISale {
	id: number;
	center_id: number;

	customer_id: number;
	invoice_no: string;
	invoice_date: Date;
	lr_no?: string;
	lr_date?: Date;

	invoice_type: string;
	order_no: string;
	order_date: Date;
	total_quantity: number;
	no_of_items: number;
	after_tax_value: number;
	cgs_t: number;
	sgs_t: number;
	igs_t: number;
	total_value: number;
	transport_charges: number;
	unloading_charges: number;
	misc_charges: number;
	net_total: number;
	no_of_boxes: number;
	status: string;
	sale_date_time: Date;
	revision: number;
	old_customer_id: number;
	hasCustomerChange: boolean;

	stock_issue_ref: string;
	stock_issue_date_ref?: Date;
	round_off: number;
	retail_customer_name: string;
	retail_customer_address: string;
	retail_customer_phone: string;
	print_count: number;
	inv_gen_mode: string;

	enquiry_ref: number;

	createdAt?: Date;
	updatedAt?: Date;
	created_by?: number;
	updated_by: number;
}

export class Sale implements ISale {
	@Type(() => Number)
	id!: number;

	@Type(() => Number)
	center_id: number;

	@Type(() => Number)
	customer_id: number;

	invoice_no: string;

	invoice_date: Date;
	lr_no: string;
	lr_date: Date;

	invoice_type: string;
	order_no: string;
	order_date: Date;
	@Type(() => Number)
	total_quantity: number;
	@Type(() => Number)
	no_of_items: number;
	@Type(() => Number)
	after_tax_value: number;
	@Type(() => Number)
	cgs_t: number;
	@Type(() => Number)
	sgs_t: number;
	@Type(() => Number)
	igs_t: number;
	@Type(() => Number)
	total_value: number;
	@Type(() => Number)
	transport_charges: number;
	@Type(() => Number)
	unloading_charges: number;
	@Type(() => Number)
	misc_charges: number;
	@Type(() => Number)
	net_total: number;
	@Type(() => Number)
	no_of_boxes: number;
	status: string;
	sale_date_time: Date;
	@Type(() => Number)
	revision: number;
	@Type(() => Number)
	old_customer_id: number;

	hasCustomerChange: boolean;

	stock_issue_ref: string;
	stock_issue_date_ref: Date;
	@Type(() => Number)
	round_off: number;
	retail_customer_name: string;
	retail_customer_address: string;
	retail_customer_phone: string;
	print_count: number;
	inv_gen_mode: string;

	enquiry_ref!: number;

	@Type(() => Date)
	createdAt: Date;
	@Type(() => Date)
	updatedAt: Date;
	@Type(() => Number)
	created_by: number;
	@Type(() => Number)
	updated_by: number;

	constructor(
		id: number,
		center_id: number,

		customer_id: number,
		invoice_no: string,
		invoice_date: Date,
		lr_no: string,
		lr_date: Date,

		invoice_type: string,
		order_no: string,
		order_date: Date,
		total_quantity: number,
		no_of_items: number,
		after_tax_value: number,
		cgs_t: number,
		sgs_t: number,
		igs_t: number,
		total_value: number,
		transport_charges: number,
		unloading_charges: number,
		misc_charges: number,
		net_total: number,
		no_of_boxes: number,
		status: string,
		sale_date_time: Date,
		revision: number,
		old_customer_id: number,
		hasCustomerChange: boolean,

		stock_issue_ref: string,
		stock_issue_date_ref: Date,
		round_off: number,
		retail_customer_name: string,
		retail_customer_address: string,
		retail_customer_phone: string,
		print_count: number,
		inv_gen_mode: string,

		createdAt: Date,
		updatedAt: Date,
		created_by: number,
		updated_by: number,
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