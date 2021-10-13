import { IBrand, Brand } from '../domain/Brand';

import { BrandDTO } from '../dtos/brand.dto';

import { Repo } from './repo.interface';

export interface IBrandRepo {
	//add product
	addBrand(brand: IBrand): Promise<any>;
}
