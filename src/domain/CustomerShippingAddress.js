import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export class CustomerShippingAddress {
	id;

	center_id;

	customer_id;

	state_id;

	address1;
	address2;
	address3;
	district;
	pin;
	def_address;

	is_active;

	createdAt;

	updatedAt;

	created_by;

	updated_by;

	constructor(
		id,
		center_id,
		customer_id,
		state_id,

		address1,
		address2,
		address3,
		district,
		pin,
		def_address,
		is_active,

		createdAt,
		updatedAt,
		created_by,
		updated_by,
	) {
		this.id = id;
		this.center_id = center_id;
		this.customer_id = customer_id;

		this.state_id = state_id;

		this.address1 = address1;
		this.address2 = address2;
		this.address3 = address3;
		this.district = district;
		this.pin = pin;
		this.def_address = def_address;
		this.is_active = is_active;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
