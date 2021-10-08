import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export interface ICustomerShippingAddress {
	id?: number;
	center_id: number;
	customer_id: number;
	state_id: number;

	address1: string;
	address2: string;
	address3: string;
	district: string;
	pin: string;

	def_address: string;
	is_active: string;

	createdAt?: Date;
	updatedAt?: Date;
	created_by?: number;
	updated_by?: number;
}

export class CustomerShippingAddress implements ICustomerShippingAddress {
	@Type(() => Number)
	id: number;

	@Type(() => Number)
	center_id: number;

	@Type(() => Number)
	customer_id: number;

	@Type(() => Number)
	state_id: number;

	address1: string;
	address2: string;
	address3: string;
	district: string;
	pin: string;
	def_address: string;

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
		customer_id: number,
		state_id: number,

		address1: string,
		address2: string,
		address3: string,
		district: string,
		pin: string,
		def_address: string,
		is_active: string,

		createdAt: Date,
		updatedAt: Date,
		created_by: number,
		updated_by: number,
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
