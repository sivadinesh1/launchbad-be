import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export interface IBrand {
	id?: number;
	center_id: number;

	payment_ref_id: number;
	sale_ref_id: number;

	applied_amount: number;
	sale_return_ref_id: number;

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

	@Type(() => Number)
	payment_ref_id: number;

	@Type(() => Number)
	sale_ref_id: number;

	@Type(() => Number)
	applied_amount: number;

	@Type(() => Number)
	sale_return_ref_id: number;

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

		payment_ref_id: number,
		sale_ref_id: number,

		applied_amount: number,
		sale_return_ref_id: number,

		createdAt: Date,
		updatedAt: Date,
		created_by: number,
		updated_by: number,
	) {
		this.id = id;
		this.center_id = center_id;

		this.payment_ref_id = payment_ref_id;
		this.sale_ref_id = sale_ref_id;

		this.applied_amount = applied_amount;
		this.sale_return_ref_id = sale_return_ref_id;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
