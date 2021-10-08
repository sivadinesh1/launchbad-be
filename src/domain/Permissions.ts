import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export interface IPermissions {
	id?: number;
	center_id: number;

	role_id: number;
	operation: string;
	resource: string;
	is_access: string;

	createdAt?: Date;
	updatedAt?: Date;
	created_by?: number;
	updated_by?: number;
}

export class Permissions implements IPermissions {
	@Type(() => Number)
	id: number;

	@Type(() => Number)
	center_id: number;

	role_id: number;
	operation: string;
	resource: string;
	is_access: string;

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
		role_id: number,
		operation: string,
		resource: string,
		is_access: string,

		createdAt: Date,
		updatedAt: Date,
		created_by: number,
		updated_by: number,
	) {
		this.id = id;
		this.center_id = center_id;

		this.role_id = role_id;
		this.operation = operation;
		this.resource = resource;
		this.is_access = is_access;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
