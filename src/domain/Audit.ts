import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export interface IAudit {
	id?: number;
	center_id: number;
	revision: number;
	module: string;
	module_ref_id: number;
	module_ref_det_id: number;
	action: string;
	old_value: string;
	new_value: string;
	audit_date: Date;

	createdAt?: Date;
	updatedAt?: Date;
	created_by?: number;
	updated_by?: number;
}

export class Audit implements IAudit {
	@Type(() => Number)
	id: number;

	@Type(() => Number)
	center_id: number;

	@Type(() => Number)
	revision: number;
	module: string;
	@Type(() => Number)
	module_ref_id: number;
	@Type(() => Number)
	module_ref_det_id: number;
	action: string;
	old_value: string;
	new_value: string;
	audit_date: Date;

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

		revision: number,
		module: string,
		module_ref_id: number,
		module_ref_det_id: number,
		action: string,
		old_value: string,
		new_value: string,
		audit_date: Date,

		createdAt: Date,
		updatedAt: Date,
		created_by: number,
		updated_by: number,
	) {
		this.id = id;
		this.center_id = center_id;

		this.revision = revision;
		this.module = module;
		this.module_ref_id = module_ref_id;
		this.module_ref_det_id = module_ref_det_id;
		this.action = action;
		this.old_value = old_value;
		this.new_value = new_value;
		this.audit_date = audit_date;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
