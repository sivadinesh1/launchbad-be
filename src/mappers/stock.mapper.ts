import { Stock } from '../domain/Stock';
import { StockDTO } from '../dtos/stock.dto';

export class StockMap {
	public static toDTO(stock: any): StockDTO {
		return {
			id: stock.id,
			center_id: stock.center_id,
			product_id: stock.product_id,
			mrp: stock.mrp,
			available_stock: stock.available_stock,
			open_stock: stock.open_stock,
			is_active: stock.is_active,

			createdAt: stock.createdAt,
			updatedAt: stock.updatedAt,
			created_by: stock.created_by,
			updated_by: stock.updated_by,
		};
	}
}
