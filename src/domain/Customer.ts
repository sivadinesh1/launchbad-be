import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export interface ICustomer {
	id?: number;
	center_id: number;
	state_id: number;

	name: string;
	address1: string;
	address2: string;
	address3: string;
	district: string;
	pin: string;
	gst: string;
	phone: string;
	whatsapp: string;

	mobile: string;
	mobile2: string;
	email: string;
	is_active: string;
	contact: string;
	tin: string;
	pan_no: string;
	credit_amt: number;
	balance_amt: number;
	last_paid_date: Date;

	createdAt?: Date;
	updatedAt?: Date;
	created_by?: number;
	updated_by?: number;
}

export class Customer implements ICustomer {
	@Type(() => Number)
	id: number;

	@Type(() => Number)
	center_id: number;

	@Type(() => Number)
	state_id: number;

	name: string;
	address1: string;
	address2: string;
	address3: string;
	district: string;
	pin: string;
	gst: string;
	phone: string;
	whatsapp: string;

	mobile: string;
	mobile2: string;
	email: string;
	is_active: string;
	contact: string;
	tin: string;
	pan_no: string;

	@Type(() => Number)
	credit_amt: number;

	@Type(() => Number)
	balance_amt: number;
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
		state_id: number,
		name: string,
		address1: string,
		address2: string,
		address3: string,
		district: string,
		pin: string,
		gst: string,
		phone: string,
		whatsapp: string,

		mobile: string,
		mobile2: string,
		email: string,
		is_active: string,
		contact: string,
		tin: string,
		pan_no: string,
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
		this.state_id = state_id;
		this.name = name;
		this.address1 = address1;
		this.address2 = address2;
		this.address3 = address3;
		this.district = district;
		this.pin = pin;
		this.gst = gst;
		this.phone = phone;
		this.whatsapp = whatsapp;

		this.mobile = mobile;
		this.mobile2 = mobile2;
		this.email = email;
		this.is_active = is_active;
		this.contact = contact;
		this.tin = tin;
		this.pan_no = pan_no;
		this.credit_amt = credit_amt;
		this.balance_amt = balance_amt;
		this.last_paid_date = last_paid_date;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
