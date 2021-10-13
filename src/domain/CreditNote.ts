import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export interface ICreditNote {
	id?: number;
	center_id: number;
	credit_note_no: string;
	credit_note_total_amount: number;
	refund_status: string;
	createdAt?: Date;
	updatedAt?: Date;
	created_by?: number;
	updated_by?: number;
}

export class CreditNote implements ICreditNote {
	@Type(() => Number)
	id: number;

	@Type(() => Number)
	center_id: number;

	credit_note_no: string;
	@Type(() => Number)
	credit_note_total_amount: number;

	refund_status: string;

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

		credit_note_no: string,
		credit_note_total_amount: number,
		refund_status: string,
		createdAt: Date,
		updatedAt: Date,
		created_by: number,
		updated_by: number,
	) {
		this.id = id;
		this.center_id = center_id;

		this.credit_note_no = credit_note_no;
		this.credit_note_total_amount = credit_note_total_amount;
		this.refund_status = refund_status;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
