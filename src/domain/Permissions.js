export class Permissions {
	id;

	center_id;

	role_id;
	operation;
	resource;
	is_access;

	createdAt;

	updatedAt;

	created_by;

	updated_by;

	constructor(
		id,
		center_id,
		role_id,
		operation,
		resource,
		is_access,

		createdAt,
		updatedAt,
		created_by,
		updated_by,
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
