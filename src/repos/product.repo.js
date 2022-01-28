const { prisma } = require('../config/prisma');

const {
	currentTimeInTimeZone,
	bigIntToString,
	escapeText,
	promisifyQuery,
} = require('../utils/utils');

const addProduct = async (product, prisma) => {
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
				createdAt: currentTimeInTimeZone(),
				created_by: product.created_by,
				updated_by: product.created_by,

				stock: {
					create: {
						mrp: product.mrp,
						available_stock: product.current_stock,
						open_stock: product.current_stock,
						center_id: product.center_id,

						createdAt: currentTimeInTimeZone(),
						updatedAt: currentTimeInTimeZone(),
						created_by: product.created_by,
						updated_by: product.created_by,
					},
				},
			},
		});

		return bigIntToString(result);
	} catch (error) {
		console.log('error :: product.repo.js ' + error);
		throw new Error(`Errored while add product ..` + error.message);
	}
};

const updateProduct = async (product, prisma) => {
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
		throw new Error(`Errored while update product ..` + error.message);
	}
};

const isProductExists = async (product_code, center_id, prisma) => {
	try {
		const result = await prisma.product.count({
			where: {
				center_id: Number(center_id),
				product_code: escapeText(product_code),
			},
		});

		return result;
	} catch (error) {
		console.log('error :: IsProductExists: product.repo.js ' + error);
		throw new Error(`Errored while isProductExists ..` + error.message);
	}
};
// select id from product where product_code='${jsonObj.product_code}'
// 							and center_id = '${jsonObj.center_id}'),

// const brandRepoGetAllBrands = async (center_id, status) => {
// 	const result = await prisma.brand.findMany({
// 		where: {
// 			center_id: Number(center_id),
// 			is_active: status,
// 		},
// 		orderBy: {
// 			brand_name: 'asc',
// 		},
// 	});
// 	return bigIntToString(result);
// };

const getProductId = async (product_code, center_id, prisma) => {
	try {
		const result = await prisma.product.findMany({
			where: {
				center_id: Number(center_id),
				product_code: escapeText(product_code),
			},
		});

		return bigIntToString(result[0].id);
	} catch (error) {
		console.log('error :: getProductId: product.repo.js ' + error);
		throw new Error(`Errored while getProductId ..` + error.message);
	}
};

//public async updateProduct(product: IProduct) {
const searchProduct = async (
	center_id,
	search_text,
	offset = 0,
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

	let result1 = await promisifyQuery(query);

	let result2 = await searchProductCountStar(center_id, search_text);

	return { full_count: result2[0].full_count, result: result1 };
};

const searchProductCountStar = async (center_id, search_text) => {
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

const updateLatestPurchasePrice = async (purchase_price, mrp, id, prisma) => {
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

		throw new Error(
			`Errored while updateLatestPurchasePrice ..` + error.message
		);
	}
};

module.exports = {
	addProduct,
	updateProduct,
	isProductExists,
	searchProduct,
	updateLatestPurchasePrice,
	getProductId,
};
