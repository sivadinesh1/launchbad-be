import prisma from '../config/prisma';
import { Audit, IAudit } from '../domain/Audit';

const { currentTimeInTimeZone, bigIntToString, escapeText, promisifyQuery } = require('../utils/utils');

class AuditRepo {
	// createProduct

	public async addAudit(audit: IAudit, prisma: any) {
		try {
			const result = await prisma.audit.create({
				data: {
					center_id: audit.center_id,
					revision: audit.revision,
					module: audit.module,
					module_ref_id: audit.module_ref_id,
					module_ref_det_id: audit.module_ref_det_id,
					action: audit.action,
					old_value: audit.old_value,
					new_value: audit.new_value,
					audit_date: audit.audit_date,
					created_by: audit.created_by,
					updated_by: audit.updated_by,
				},
			});

			return bigIntToString(result);
		} catch (error) {
			console.log('error :: audit.repo.ts: addAudit ' + error);
			throw error;
		}
	}
}

export default new AuditRepo();
