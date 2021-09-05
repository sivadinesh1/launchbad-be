var pool = require('../config/db');

const { handleError, ErrorHandler } = require('../config/error');

const { toTimeZone, currentTimeInTimeZone, promisifyQuery } = require('../utils/utils');

const { getSearchCustomers } = require('./customers.service');

const searchProductInformation = async (requestBody) => {
	const [centerid, customerid, orderdate, searchstr] = Object.values(requestBody);

	// initially checks if product has custom discount for the selected customer. if yes, takes that discount
	// if no custom discount available, it then gets the default discount. brand = 0 for defaults

	let sql = ` select a.product_code as product_code, a.description, b.mrp, a.taxrate, b.available_stock,
	a.packetsize as qty, a.unit_price, a.id as product_id, b.id as stock_pk, a.rackno,
IFNULL(
(
select concat(value,'~',type) 
from discount 
where str_to_date('${orderdate}','%d-%m-%Y')  
between str_to_date(startdate, '%d-%m-%Y') and str_to_date(enddate, '%d-%m-%Y') and
customer_id = '${customerid}' and
gst_slab = a.taxrate and
a.brand_id = discount.brand_id and
discount.brand_id = a.brand_id
), 
(  select concat(value,'~',type) 
from discount 
where str_to_date('${orderdate}','%d-%m-%Y')  
between str_to_date(startdate, '%d-%m-%Y') and str_to_date(enddate, '%d-%m-%Y') and
customer_id = '${customerid}' and
gst_slab = a.taxrate and
discount.brand_id = 0 )
	
	) as disc_info,
	brand.name as name
from 
product a, 
stock b,
brand
where 
brand.id = a.brand_id and 
a.id = b.product_id and
a.center_id = '${centerid}' and
( a.product_code like '%${searchstr}%' or
a.description like '%${searchstr}%' ) limit 50 
`;

	return promisifyQuery(query);
};

const searchProduct = async (requestBody) => {
	const [centerid, searchstr, searchby] = Object.values(requestBody);

	let sql = '';
	// -- select Produsct based on this query --
	// -- combiles multiple MRP stock to one sum --
	// -- can be used for Regular search and product purchase --
	// --- b.available_stock,
	// -- b.id as stock_pk, -- commented this out, if needed in sales then implement the same way as earlier --
	// 	-- 		LEFT outer JOIN   stock b
	// -- 		ON b.product_id = a.id
	sql = `
	select a.product_code as product_code, 
  		a.description, 
  		a.mrp, 
  		a.taxrate, 
  		(select sum(s2.available_stock) from stock s2 where s2.product_id = a.id ) as available_stock, 
			IFNULL((		select stock_level from item_history ih 
				where ih.product_ref_id = a.id order by ih.id desc limit 1), 0) as true_stock,
  		a.packetsize, a.unit_price, a.purchase_price as purchase_price, a.id as product_id, 
		
		a.packetsize as qty, 
		a.rackno, 
		bd.name,
		bd.id as brand_id, 
		a.unit as uom, 
		a.hsncode as hsncode, 
		a.minqty as minqty, 
		a.avgpurprice as avgpurprice,
		a.unit_price as unit_price, 
		a.salesprice as salesprice,  
		a.maxdiscount as maxdiscount, 
		a.currentstock as currentstock
		from 
		brand bd,
		product a

		where 
		a.center_id = '${centerid}' and
		a.brand_id = bd.id and
		( a.product_code like '%${searchstr}%' or
		a.description like '%${searchstr}%' ) limit 50
	`;

	return promisifyQuery(query);
};

const getAllInventory = async () => {
	let query = `select p.product_code, p.description, p.mrp, s.available_stock
  from product p, 
       stock s 
  where p.product_code= s.product_code`;

	return promisifyQuery(query);
};

const getAllClients = async () => {
	let query = `select * from customer where isactive = 'A'`;

	return promisifyQuery(query);
};

const getAllActiveVendors = async (centerid) => {
	let query = `select v.id, v.center_id, v.name, v.address1, v.address2, v.address3, v.district, s.id as state_id, s.code, s.description as state,
	v.pin, v.gst, v.phone, v.mobile, v.mobile2, v.whatsapp, v.email, v.isactive, v.credit_amt,
	v.balance_amt, 
	DATE_FORMAT(v.last_paid_date, '%d-%b-%Y') as last_paid_date
	from 
	vendor v,
	state s
	where 
	v.state_id = s.id and isactive = 'A' and center_id = ${centerid} order by v.name`;

	return promisifyQuery(query);
};

const getAllActiveCustomersByCenter = async (center_id) => {
	let query = `select c.id, c.center_id, c.name, c.address1, c.address2, c.district, s.id as state_id, s.code, s.description,
	c.pin, c.gst, c.phone, c.mobile, c.mobile2, c.whatsapp, c.email, 
	c.isactive, c.credit_amt as credit_amt, c.balance_amt as balance_amt, 
	DATE_FORMAT(c.last_paid_date, '%d-%b-%Y') as last_paid_date
	from 
	customer c,
	state s
	where 
	c.state_id = s.id and isactive = 'A' and center_id = ${center_id} 	order by name `;
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
	searchProduct,

	getAllInventory,
	getAllClients,
	getAllActiveVendors,
	getAllActiveCustomersByCenter,

	addPartsDetailsEnquiry,
	updateTaxRate,
	getAllPaymentModes,
};
