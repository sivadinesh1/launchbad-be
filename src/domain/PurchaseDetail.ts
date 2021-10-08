import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export interface IBrand {
	id?: number;
	center_id: number;
	purchase_id: number;
	product_id: number;
	stock_id: number;
	quantity: number;
	purchase_price: string;
	mrp: string;
	batch_date: Date;
	tax: number;
	igs_t: number;
	cgs_t: number;
	sgs_t: number;
	taxable_value: number;
	total_value: number;

	createdAt?: Date;
	updatedAt?: Date;
	created_by?: number;
	updated_by?: number;
}

export class Brand implements IBrand {
	@Type(() => Number)
	id: number;

	@Type(() => Number)
	center_id: number;

	purchase_id: number;
	product_id: number;
	stock_id: number;
	quantity: number;
	purchase_price: string;
	mrp: string;
	@Type(() => Date)
	batch_date: Date;
	tax: number;
	igs_t: number;
	cgs_t: number;
	sgs_t: number;
	taxable_value: number;
	total_value: number;

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

		purchase_id: number,
		product_id: number,
		stock_id: number,
		quantity: number,
		purchase_price: string,
		mrp: string,
		batch_date: Date,
		tax: number,
		igs_t: number,
		cgs_t: number,
		sgs_t: number,
		taxable_value: number,
		total_value: number,

		createdAt: Date,
		updatedAt: Date,
		created_by: number,
		updated_by: number,
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
		this.taxable_value = taxable_value;
		this.total_value = total_value;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
