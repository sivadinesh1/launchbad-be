import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export interface IPaymentMode {
	id?: number;
	center_id: number;

	payment_mode_name: string;
	payment_type: string;
	commission_fee: number;
	is_active: string;

	createdAt?: Date;
	updatedAt?: Date;
	created_by?: number;
	updated_by?: number;
}

export class PaymentMode implements IPaymentMode {
	@Type(() => Number)
	id: number;

	@Type(() => Number)
	center_id: number;

	payment_mode_name: string;
	payment_type: string;
	commission_fee: number;
	is_active: string;

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

		payment_mode_name: string,
		payment_type: string,
		commission_fee: number,

		is_active: string,

		createdAt: Date,
		updatedAt: Date,
		created_by: number,
		updated_by: number,
	) {
		this.id = id;
		this.center_id = center_id;

		this.payment_mode_name = payment_mode_name;
		this.payment_type = payment_type;
		this.commission_fee = commission_fee;

		this.is_active = is_active;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
