import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export class BackOrder {
	id;

	center_id;

	customer_id;

	enquiry_detail_id;

	quantity;

	reason;
	status;

	order_date;

	createdAt;

	updatedAt;

	created_by;

	updated_by;

	constructor(
		id,
		center_id,
		customer_id,
		enquiry_detail_id,
		quantity,
		reason,
		status,
		order_date,

		createdAt,

		created_by,
		updated_by,
	) {
		this.id = id;
		this.center_id = center_id;

		this.customer_id = customer_id;
		this.enquiry_detail_id = enquiry_detail_id;
		this.quantity = quantity;
		this.reason = reason;
		this.status = status;
		this.order_date = order_date;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
