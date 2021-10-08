import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export interface IPurchase {
	id?: number;
	center_id: number;
	vendor_id: number;
	invoice_no: string;
	invoice_date: string;
	lr_no: string;
	lr_date: string;
	received_date: string;
	purchase_type: string;
	order_no: string;
	order_date: string;
	total_quantity: number;
	no_of_items: number;
	taxable_value: number;
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
	stock_inwards_date_time: string;
	round_off: number;
	revision: number;

	createdAt?: Date;
	updatedAt?: Date;
	created_by?: number;
	updated_by?: number;
}

export class Purchase implements IPurchase {
	@Type(() => Number)
	id: number;

	@Type(() => Number)
	center_id: number;

	@Type(() => Number)
	vendor_id: number;

	invoice_no: string;
	invoice_date: string;
	lr_no: string;
	lr_date: string;
	received_date: string;
	purchase_type: string;
	order_no: string;
	order_date: string;

	@Type(() => Number)
	total_quantity: number;

	@Type(() => Number)
	no_of_items: number;

	@Type(() => Number)
	taxable_value: number;
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
	stock_inwards_date_time: string;
	@Type(() => Number)
	round_off: number;
	@Type(() => Number)
	revision: number;

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

		vendor_id: number,
		invoice_no: string,
		invoice_date: string,
		lr_no: string,
		lr_date: string,
		received_date: string,
		purchase_type: string,
		order_no: string,
		order_date: string,
		total_quantity: number,
		no_of_items: number,
		taxable_value: number,
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
		stock_inwards_date_time: string,
		round_off: number,
		revision: number,

		createdAt: Date,
		updatedAt: Date,
		created_by: number,
		updated_by: number,
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
		this.taxable_value = taxable_value;
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
