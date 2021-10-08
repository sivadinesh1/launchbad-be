import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export interface IVendorPaymentDetail {
	id?: number;
	center_id: number;

	vendor_payment_ref_id: number;
	purchase_ref_id: number;
	applied_amount: number;

	createdAt?: Date;
	updatedAt?: Date;
	created_by?: number;
	updated_by?: number;
}

export class VendorPaymentDetail implements IVendorPaymentDetail {
	@Type(() => Number)
	id: number;

	@Type(() => Number)
	center_id: number;

	vendor_payment_ref_id: number;
	purchase_ref_id: number;
	applied_amount: number;

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

		vendor_payment_ref_id: number,
		purchase_ref_id: number,
		applied_amount: number,

		createdAt: Date,
		updatedAt: Date,
		created_by: number,
		updated_by: number,
	) {
		this.id = id;
		this.center_id = center_id;

		this.vendor_payment_ref_id = vendor_payment_ref_id;
		this.purchase_ref_id = purchase_ref_id;
		this.applied_amount = applied_amount;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
