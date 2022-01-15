const { prisma } = require('../config/prisma');

const {
	currentTimeInTimeZone,
	bigIntToString,
	escapeText,
	promisifyQuery,
} = require('../utils/utils');

const productRepoAddProduct = async (product) => {
	try {
		const result = await prisma.product.create({
			data: {
				center_id: product.center_id,
				brand_id: product.brand_id,
				product_type: product.product_type,
				product_code: product.product_code,
				product_description: escapeText(product.product_description),

				packet_size: product.packet_size,
				hsn_code: product.hsn_code,
				current_stock: product.current_stock,
				unit_price: product.unit_price,
				mrp: product.mrp,
				purchase_price: product.purchase_price,
				sales_price: product.sales_price,
				uom: product.uom,
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
				created_by: product.created_by,
				updated_by: product.created_by,
			},
		});

		return bigIntToString(result);
	} catch (error) {
		console.log('error :: product.repo.js ' + error);
		throw error;
	}
};

const productRepoUpdateProduct = async (product) => {
	try {
		const result = await prisma.product.update({
			where: {
				id: product.id,
			},
			data: {
				center_id: product.center_id,
				brand_id: product.brand_id,
				product_type: product.product_type,
				product_code: product.product_code,
				product_description: escapeText(product.product_description),

				packet_size: product.packet_size,
				hsn_code: product.hsn_code,
				current_stock: product.current_stock,
				unit_price: product.unit_price,
				mrp: product.mrp,
				purchase_price: product.purchase_price,
				sales_price: product.sales_price,
				uom: product.uom,
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
				created_by: product.created_by,
			},
		});

		return bigIntToString(result);
	} catch (error) {
		console.log('error :: product.repo.js ' + error);
		throw error;
	}
};

const productRepoIsProductExists = async (product_code, center_id) => {
	try {
		const result = await prisma.product.count({
			where: {
				center_id: Number(center_id),
				product_code: escapeText(product_code),
			},
		});

		return result;
	} catch (error) {
		console.log(
			'error :: productRepoIsProductExists: product.repo.js ' + error
		);
		throw error;
	}
};

//public async updateProduct(product: IProduct) {
const productRepoSearchProduct = async (
	center_id,
	search_text,
	offset = 1,
	length = 20
) => {
	let query = `
    select a.product_type as product_type, a.product_code as product_code, 
        a.product_description, 
        a.mrp, 
        a.tax_rate as tax,  
        IFNULL((select sum(s2.available_stock) from stock s2 where s2.product_id = a.id ), 0) as available_stock, 
        IFNULL((		select stock_level from item_history ih 
          where ih.product_ref_id = a.id order by ih.id desc limit 1), 0) as true_stock,
        a.packet_size, a.unit_price, a.purchase_price as purchase_price, a.id as product_id, 
      
      a.packet_size as packet_size, 
      a.rack_info, 
      bd.brand_name,
      bd.id as brand_id, 
      a.uom as uom, 
      a.hsn_code as hsn_code, 
      a.minimum_quantity as minimum_quantity, 
      a.average_purchase_price as average_purchase_price,
      a.unit_price as unit_price, 
      a.sales_price as sales_price,  
      a.max_discount as max_discount, 
      a.current_stock as current_stock
      from 
      brand bd,
      product a
      where 
      a.center_id = '${center_id}' and
      a.brand_id = bd.id `;

	if (search_text !== '') {
		query =
			query +
			` and ( a.product_code like '%${search_text}%' or
		a.product_description like '%${search_text}%' )	`;
	}

	query = query + ` limit ${offset}, ${length} `;
	console.log('dinesh  ' + query);
	let result1 = await promisifyQuery(query);

	let result2 = await productRepoSearchProductCountStar(
		center_id,
		search_text
	);

	return { full_count: result2[0].full_count, result: result1 };
};

const productRepoSearchProductCountStar = async (center_id, search_text) => {
	let query = `
    select count(*) as full_count
      from 
      brand bd,
      product a
      where 
      a.center_id = '${center_id}' and
      a.brand_id = bd.id `;

	if (search_text !== '') {
		query =
			query +
			` and ( a.product_code like '%${search_text}%' or
		a.product_description like '%${search_text}%' )	`;
	}

	return promisifyQuery(query);
};

const productRepoUpdateLatestPurchasePrice = async (
	purchase_price,
	mrp,
	id,
	prisma
) => {
	try {
		const result = await prisma.product.update({
			where: {
				id: Number(id),
			},
			data: {
				purchase_price: Number(purchase_price),
				unit_price: Number(purchase_price),
				mrp: Number(mrp),
			},
		});

		return bigIntToString(result);
	} catch (error) {
		console.log('error :: product.repo.js ' + error.message);
		throw error;
	}
};

module.exports = {
	productRepoAddProduct,
	productRepoUpdateProduct,
	productRepoIsProductExists,
	productRepoSearchProduct,
	productRepoUpdateLatestPurchasePrice,
};
