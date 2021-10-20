var pool = require('../config/db');

const { handleError, ErrorHandler } = require('../config/error');

const { toTimeZone, currentTimeInTimeZone, promisifyQuery } = require('../utils/utils');

const { getSearchCustomers } = require('./customers.service');

const searchProductInformation = async (requestBody) => {
	const [center_id, customer_id, order_date, search_text] = Object.values(requestBody);

	// initially checks if product has custom discount for the selected customer. if yes, takes that discount
	// if no custom discount available, it then gets the default discount. brand = 0 for defaults

	let query = ` select a.product_code as product_code, a.product_description, b.mrp, a.tax_rate, b.available_stock,
	a.packet_size as qty, a.unit_price, a.id as product_id, b.id as stock_pk, a.rack_info,
IFNULL(
(
select concat(value,'~',type)  
from discount 
where str_to_date('${order_date}','%d-%m-%Y')  
between start_date and end_date and
customer_id = '${customer_id}' and
gst_slab = a.tax_rate and
a.brand_id = discount.brand_id and
discount.brand_id = a.brand_id
), 
(  select concat(value,'~',type) 
from discount 
where str_to_date('${order_date}','%d-%m-%Y')  
between start_date and end_date and
customer_id = '${customer_id}' and
gst_slab = a.tax_rate and
discount.brand_id = 0 )
	
	) as disc_info,
	brand.brand_name as name
from 
product a, 
stock b,
brand
where 
brand.id = a.brand_id and 
a.id = b.product_id and
a.center_id = '${center_id}' and
( a.product_code like '%${search_text}%' or
a.product_description like '%${search_text}%' ) limit 50 
`;

	return promisifyQuery(query);
};

// const searchProduct = async (requestBody) => {
// 	const [center_id, searchstr, searchby] = Object.values(requestBody);

// 	let sql = '';
// 	// -- select Produsct based on this query --
// 	// -- combiles multiple MRP stock to one sum --
// 	// -- can be used for Regular search and product purchase --
// 	// --- b.available_stock,
// 	// -- b.id as stock_pk, -- commented this out, if needed in sales then implement the same way as earlier --
// 	// 	-- 		LEFT outer JOIN   stock b
// 	// -- 		ON b.product_id = a.id
// 	query = `
// 	select a.product_code as product_code,
//   		a.product_description,
//   		a.mrp,
//   		a.tax_rate,
//   		(select sum(s2.available_stock) from stock s2 where s2.product_id = a.id ) as available_stock,
// 			IFNULL((		select stock_level from item_history ih
// 				where ih.product_ref_id = a.id order by ih.id desc limit 1), 0) as true_stock,
//   		a.packet_size, a.unit_price, a.purchase_price as purchase_price, a.id as product_id,

// 		a.packet_size as packet_size,
// 		a.rack_info,
// 		bd.name,
// 		bd.id as brand_id,
// 		a.uom as uom,
// 		a.hsn_code as hsn_code,
// 		a.minimum_quantity as minimum_quantity,
// 		a.average_purchase_price as average_purchase_price,
// 		a.unit_price as unit_price,
// 		a.sales_price as sales_price,
// 		a.max_discount as max_discount,
// 		a.current_stock as current_stock
// 		from
// 		brand bd,
// 		product a
// 		where
// 		a.center_id = '${center_id}' and
// 		a.brand_id = bd.id and
// 		( a.product_code like '%${searchstr}%' or
// 		a.product_description like '%${searchstr}%' ) limit 50
// 	`;

// 	return promisifyQuery(query);
// };

const getAllInventory = async () => {
	let query = `select p.product_code, p.product_description, p.mrp, s.available_stock
  from product p, 
       stock s 
  where p.product_code= s.product_code`;

	return promisifyQuery(query);
};

const getAllClients = async () => {
	let query = `select * from customer where is_active = 'A'`;

	return promisifyQuery(query);
};

const getAllActiveVendors = async (center_id) => {
	let query = `select v.id, v.center_id, v.vendor_name, v.address1, v.address2, v.address3, v.district, s.id as state_id, s.code, s.description as state,
	v.pin, v.gst, v.phone, v.mobile, v.mobile2, v.whatsapp, v.email, v.is_active, v.credit_amt,
	v.balance_amt, 
	DATE_FORMAT(v.last_paid_date, '%d-%b-%Y') as last_paid_date
	from 
	vendor v,
	state s
	where 
	v.state_id = s.id and is_active = 'A' and center_id = ${center_id} order by v.vendor_name`;

	return promisifyQuery(query);
};

const getAllActiveCustomersByCenter = async (center_id) => {
	let query = `select c.id, c.center_id, c.name, c.address1, c.address2, c.district, s.id as state_id, s.code, s.description,
	c.pin, c.gst, c.phone, c.mobile, c.mobile2, c.whatsapp, c.email, 
	c.is_active, c.credit_amt as credit_amt, c.balance_amt as balance_amt, 
	DATE_FORMAT(c.last_paid_date, '%d-%b-%Y') as last_paid_date
	from 
	customer c,
	state s
	where 
	c.state_id = s.id and is_active = 'A' and center_id = ${center_id} 	order by name `;
	return promisifyQuery(query);
};

const addPartsDetailsEnquiry = async (requestBody) => {
	let yourJsonObj = requestBody;

	var objectKeysArray = Object.keys(yourJsonObj);
	objectKeysArray.forEach(function (objKey) {
		var objValue = yourJsonObj[objKey];

		let query = `INSERT INTO enquiry_detail ( enquiry_id, item_code, qty) values ( '${objValue.enquiryid}','${objValue.partno}','${objValue.quantity}')`;

		promisifyQuery(query);
	});
};

const updateTaxRate = async (requestBody) => {
	let taxrate = requestBody.taxrate;
	let id = requestBody.productid;

	let query = `update product 
	set 
	taxrate = '${taxrate}' 
	where id = '${id}' `;
	promisifyQuery(query);
};

const getAllPaymentModes = async (center_id, status) => {
	let query = `select * from payment_mode where center_id = '${center_id}' and is_active = '${status}'`;

	promisifyQuery(query);
};

module.exports = {
	searchProductInformation,

	getAllInventory,
	getAllClients,
	getAllActiveVendors,
	getAllActiveCustomersByCenter,

	addPartsDetailsEnquiry,
	updateTaxRate,
	getAllPaymentModes,
};
