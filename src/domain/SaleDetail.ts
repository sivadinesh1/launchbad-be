import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export interface ISaleDetail {
	id?: number;
	center_id: number;

	sale_id: number;
	product_id: number;
	stock_id: number;
	quantity: number;
	unit_price: number;
	mrp: string;
	batch_date: string;
	tax: number;
	igs_t: number;
	cgs_t: number;
	sgs_t: number;
	taxable_value: number;
	total_value: number;
	disc_value: number;
	disc_percent: number;
	disc_type: string;
	returned: string;

	createdAt?: Date;
	updatedAt?: Date;
	created_by?: number;
	updated_by?: number;
}

export class SaleDetail implements ISaleDetail {
	@Type(() => Number)
	id: number;

	@Type(() => Number)
	center_id: number;

	@Type(() => Number)
	sale_id: number;
	@Type(() => Number)
	product_id: number;
	@Type(() => Number)
	stock_id: number;
	@Type(() => Number)
	quantity: number;
	@Type(() => Number)
	unit_price: number;
	mrp: string;

	batch_date: string;
	@Type(() => Number)
	tax: number;
	@Type(() => Number)
	igs_t: number;
	@Type(() => Number)
	cgs_t: number;
	@Type(() => Number)
	sgs_t: number;
	@Type(() => Number)
	taxable_value: number;
	@Type(() => Number)
	total_value: number;
	@Type(() => Number)
	disc_value: number;
	@Type(() => Number)
	disc_percent: number;
	disc_type: string;
	returned: string;

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

		sale_id: number,
		product_id: number,
		stock_id: number,
		quantity: number,
		unit_price: number,
		mrp: string,
		batch_date: string,
		tax: number,
		igs_t: number,
		cgs_t: number,
		sgs_t: number,
		taxable_value: number,
		total_value: number,
		disc_value: number,
		disc_percent: number,
		disc_type: string,
		returned: string,

		createdAt: Date,
		updatedAt: Date,
		created_by: number,
		updated_by: number,
	) {
		this.id = id;
		this.center_id = center_id;

		this.sale_id = sale_id;
		this.product_id = product_id;
		this.stock_id = stock_id;
		this.quantity = quantity;
		this.unit_price = unit_price;
		this.mrp = mrp;
		this.batch_date = batch_date;
		this.tax = tax;
		this.igs_t = igs_t;
		this.cgs_t = cgs_t;
		this.sgs_t = sgs_t;
		this.taxable_value = taxable_value;
		this.total_value = total_value;
		this.disc_value = disc_value;
		this.disc_percent = disc_percent;
		this.disc_type = disc_type;
		this.returned = returned;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
