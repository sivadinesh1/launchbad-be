import { Vendor } from '../domain/Vendor';
import { VendorDTO } from '../dtos/vendor.dto';

export class VendorMap {
	public static toDTO(vendor: any): VendorDTO {
		return {
			id: vendor.id,
			center_id: vendor.center_id,
			vendor_name: vendor.vendor_name,

			address1: vendor.address1,
			address2: vendor.address2,
			address3: vendor.address3,
			district: vendor.district,
			state_id: vendor.state_id,
			pin: vendor.pin,
			gst: vendor.gst,
			phone: vendor.phone,
			mobile: vendor.mobile,
			mobile2: vendor.mobile2,
			whatsapp: vendor.whatsapp,
			email: vendor.email,
			is_active: vendor.is_active,
			credit_amt: vendor.credit_amt,
			balance_amt: vendor.balance_amt,
			last_paid_date: vendor.last_paid_date,

			createdAt: vendor.createdAt,
			updatedAt: vendor.updatedAt,
			created_by: vendor.created_by,
			updated_by: vendor.updated_by,
		};
	}
}
