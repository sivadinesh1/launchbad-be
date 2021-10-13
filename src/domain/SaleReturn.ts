import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export interface ISaleReturn {
	id?: number;
	center_id: number;
	sale_id: number;
	cr_note_id: number;
	return_date: Date;
	to_return_amount: number;
	amount_returned: number;
	to_receive_items: number;
	received_items: number;
	receive_status: string;
	refund_status: string;
	return_status: string;
	customer_id: number;

	createdAt?: Date;
	updatedAt?: Date;
	created_by?: number;
	updated_by?: number;
}

export class SaleReturn implements ISaleReturn {
	@Type(() => Number)
	id: number;

	@Type(() => Number)
	center_id: number;

	sale_id: number;
	cr_note_id: number;
	return_date: Date;
	to_return_amount: number;
	amount_returned: number;
	to_receive_items: number;
	received_items: number;
	receive_status: string;
	refund_status: string;
	return_status: string;
	customer_id: number;

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
		cr_note_id: number,
		return_date: Date,
		to_return_amount: number,
		amount_returned: number,
		to_receive_items: number,
		received_items: number,
		receive_status: string,
		refund_status: string,
		return_status: string,
		customer_id: number,

		createdAt: Date,
		updatedAt: Date,
		created_by: number,
		updated_by: number,
	) {
		this.id = id;
		this.center_id = center_id;

		this.sale_id = sale_id;
		this.cr_note_id = cr_note_id;
		this.return_date = return_date;
		this.to_return_amount = to_return_amount;
		this.amount_returned = amount_returned;
		this.to_receive_items = to_receive_items;
		this.received_items = received_items;
		this.receive_status = receive_status;
		this.refund_status = refund_status;
		this.return_status = return_status;
		this.customer_id = customer_id;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
