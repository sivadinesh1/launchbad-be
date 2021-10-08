import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export interface IItemHistory {
	id?: number;
	center_id: number;

	module: string;
	product_ref_id: number;
	purchase_id: number;
	purchase_det_id: number;
	sale_id: number;
	sale_det_id: number;
	action: string;
	action_type: string;
	txn_qty: number;
	stock_level: number;
	txn_date: Date;
	sale_return_id: number;
	purchase_return_id: number;

	createdAt?: Date;
	updatedAt?: Date;
	created_by?: number;
	updated_by?: number;
}

export class ItemHistory implements IItemHistory {
	@Type(() => Number)
	id: number;

	@Type(() => Number)
	center_id: number;

	module: string;
	product_ref_id: number;
	purchase_id: number;
	purchase_det_id: number;
	sale_id: number;
	sale_det_id: number;
	action: string;
	action_type: string;
	txn_qty: number;
	stock_level: number;
	txn_date: Date;
	sale_return_id: number;
	purchase_return_id: number;

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

		module: string,
		product_ref_id: number,
		purchase_id: number,
		purchase_det_id: number,
		sale_id: number,
		sale_det_id: number,
		action: string,
		action_type: string,
		txn_qty: number,
		stock_level: number,
		txn_date: Date,
		sale_return_id: number,
		purchase_return_id: number,

		createdAt: Date,
		updatedAt: Date,
		created_by: number,
		updated_by: number,
	) {
		this.id = id;
		this.center_id = center_id;

		this.module = module;
		this.product_ref_id = product_ref_id;
		this.purchase_id = purchase_id;
		this.purchase_det_id = purchase_det_id;
		this.sale_id = sale_id;
		this.sale_det_id = sale_det_id;
		this.action = action;
		this.action_type = action_type;
		this.txn_qty = txn_qty;
		this.stock_level = stock_level;
		this.txn_date = txn_date;
		this.sale_return_id = sale_return_id;
		this.purchase_return_id = purchase_return_id;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
