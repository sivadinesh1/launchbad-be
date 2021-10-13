import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';
import { string } from 'joi';

export interface ISaleReturnDetail {
	id?: number;
	center_id: number;

	sale_return_id: number;
	sale_id: number;
	sale_detail_id: number;
	exchange_id: number;
	return_quantity: number;
	received_quantity: number;
	reason: string;
	disc_percent: number;
	tax: number;
	mrp: number;
	igs_t: number;
	cgs_t: number;
	sgs_t: number;
	orig_sold_qty: number;
	taxable_value: number;
	total_value: number;
	hsn_code: string;
	unit: string;

	createdAt?: Date;
	updatedAt?: Date;
	created_by?: number;
	updated_by?: number;
}

export class SaleReturnDetail implements ISaleReturnDetail {
	@Type(() => Number)
	id: number;

	@Type(() => Number)
	center_id: number;

	@Type(() => Number)
	sale_return_id: number;
	@Type(() => Number)
	sale_id: number;
	@Type(() => Number)
	sale_detail_id: number;
	@Type(() => Number)
	exchange_id: number;
	@Type(() => Number)
	return_quantity: number;
	@Type(() => Number)
	received_quantity: number;
	reason: string;
	@Type(() => Number)
	@Type(() => Number)
	disc_percent: number;
	@Type(() => Number)
	tax: number;
	@Type(() => Number)
	mrp: number;
	@Type(() => Number)
	igs_t: number;
	@Type(() => Number)
	cgs_t: number;
	@Type(() => Number)
	sgs_t: number;
	@Type(() => Number)
	orig_sold_qty: number;
	@Type(() => Number)
	taxable_value: number;
	@Type(() => Number)
	total_value: number;
	hsn_code: string;
	unit: string;

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

		sale_return_id: number,
		sale_id: number,
		sale_detail_id: number,
		exchange_id: number,
		return_quantity: number,
		received_quantity: number,
		reason: string,
		disc_percent: number,
		tax: number,
		mrp: number,
		igs_t: number,
		cgs_t: number,
		sgs_t: number,
		orig_sold_qty: number,
		taxable_value: number,
		total_value: number,
		hsn_code: string,
		unit: string,

		createdAt: Date,
		updatedAt: Date,
		created_by: number,
		updated_by: number,
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
		this.taxable_value = taxable_value;
		this.total_value = total_value;
		this.hsn_code = hsn_code;
		this.unit = unit;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
