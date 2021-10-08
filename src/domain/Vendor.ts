import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export interface IVendor {
	id?: number;
	center_id: number;

	vendor_name: string;
	address1: string;
	address2: string;
	address3: string;
	district: string;
	state_id: number;
	pin: string;
	gst: string;
	phone: string;
	mobile: string;
	mobile2: string;
	whatsapp: string;
	email: string;
	is_active: string;
	credit_amt: number;
	balance_amt: number;
	last_paid_date: Date;

	createdAt?: Date;
	updatedAt?: Date;
	created_by?: number;
	updated_by?: number;
}

export class Vendor implements IVendor {
	@Type(() => Number)
	id: number;

	@Type(() => Number)
	center_id: number;

	vendor_name: string;
	address1: string;
	address2: string;
	address3: string;
	district: string;
	@Type(() => Number)
	state_id: number;
	pin: string;
	gst: string;
	phone: string;
	mobile: string;
	mobile2: string;
	whatsapp: string;
	email: string;
	is_active: string;
	@Type(() => Number)
	credit_amt: number;
	@Type(() => Number)
	balance_amt: number;
	@Type(() => Date)
	last_paid_date: Date;

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

		vendor_name: string,
		address1: string,
		address2: string,
		address3: string,
		district: string,
		state_id: number,
		pin: string,
		gst: string,
		phone: string,
		mobile: string,
		mobile2: string,
		whatsapp: string,
		email: string,
		is_active: string,
		credit_amt: number,
		balance_amt: number,
		last_paid_date: Date,

		createdAt: Date,
		updatedAt: Date,
		created_by: number,
		updated_by: number,
	) {
		this.id = id;
		this.center_id = center_id;

		this.vendor_name = vendor_name;
		this.address1 = address1;
		this.address2 = address2;
		this.address3 = address3;
		this.district = district;
		this.state_id = state_id;
		this.pin = pin;
		this.gst = gst;
		this.phone = phone;
		this.mobile = mobile;
		this.mobile2 = mobile2;
		this.whatsapp = whatsapp;
		this.email = email;
		this.is_active = is_active;
		this.credit_amt = credit_amt;
		this.balance_amt = balance_amt;
		this.last_paid_date = last_paid_date;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
