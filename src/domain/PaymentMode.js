import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export class PaymentMode {
	id;

	center_id;

	payment_mode_name;
	payment_type;
	commission_fee;
	is_active;

	createdAt;

	updatedAt;

	created_by;

	updated_by;

	constructor(
		id,
		center_id,

		payment_mode_name,
		payment_type,
		commission_fee,

		is_active,

		createdAt,
		updatedAt,
		created_by,
		updated_by,
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
