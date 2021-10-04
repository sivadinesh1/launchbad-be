import { Product } from '../domain/Product';
import { ProductDTO } from '../dtos/ProductDTO';

export class ProductMap {
	public static toDTO(product: any): ProductDTO {
		return {
			id: product.id,
			center_id: product.center_id,
			brand_id: product.brand_id,
			product_code: product.product_code,
			product_description: product.product_description,
			uom: product.uom,
			packet_size: product.packet_size,
			hsn_code: product.hsn_code,
			current_stock: product.current_stock,
			unit_price: product.unit_price,
			mrp: product.mrp,
			purchase_price: product.purchase_price,
			sales_price: product.sales_price,
			rack_info: product.rack_info,
			location: product.location,
			max_discount: product.max_discount,
			alternate_code: product.alternate_code,
			tax_rate: product.tax_rate,
			minimum_quantity: product.minimum_quantity,
			item_discount: product.item_discount,
			reorder_quantity: product.reorder_quantity,
			average_purchase_price: product.average_purchase_price,
			average_sale_price: product.average_sale_price,
			margin: product.margin,
			createdAt: product.createdAt,
			updatedAt: product.updatedAt,
			created_by: product.created_by,
			updated_by: product.updated_by,
		};
	}
}
