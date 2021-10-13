import { IProduct, Product } from '../domain/Product';
import { ProductDTO } from '../dtos/product.dto';
import { Repo } from './repo.interface';

export interface IProductRepo {
	//add product
	addProduct(product: IProduct): Promise<any>;
}
