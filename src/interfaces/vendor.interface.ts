import { IVendor, Vendor } from '../domain/Vendor';

import { VendorDTO } from '../dtos/vendor.dto';

import { Repo } from './repo.interface';

export interface IVendorRepo {
	//add product
	addVendor(vendor: IVendor): Promise<any>;
}
