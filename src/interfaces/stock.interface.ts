import { IStock } from '../domain/Stock';

export interface IStockRepo {
	//add product
	addStock(stock: IStock): Promise<any>;
}
