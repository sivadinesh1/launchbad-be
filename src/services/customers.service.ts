import prisma from '../config/prisma';
var pool = require('../config/db');

const { toTimeZone, toTimeZoneFrmt, currentTimeInTimeZone, promisifyQuery, bigIntToString } = require('../utils/utils');

// insert row in customer tbl
const insertCustomer = async (insertValues: any) => {
	const data: any = await insertCustomerBlock(insertValues);
	//	console.log('dddd' + JSON.stringify(data));
	console.log('dddd' + data.id);

	let taxSlabArr = [
		{
			center_id: Number(insertValues.center_id),
			customer_id: Number(data.id),
			type: insertValues.disctype,
			gst_slab: 0,
			value: insertValues.gstzero,
			startdate: currentTimeInTimeZone('Asia/Kolkata', 'DD-MM-YYYY'),
			enddate: '01-04-9999',
			brand_id: 0,
		},
		{
			center_id: Number(insertValues.center_id),
			customer_id: Number(data.id),
			type: insertValues.disctype,
			gst_slab: 5,
			value: insertValues.gstfive,
			startdate: currentTimeInTimeZone('Asia/Kolkata', 'DD-MM-YYYY'),
			enddate: '01-04-9999',
			brand_id: 0,
		},
		{
			center_id: Number(insertValues.center_id),
			customer_id: Number(data.id),
			type: insertValues.disctype,
			gst_slab: 12,
			value: insertValues.gsttwelve,
			startdate: currentTimeInTimeZone('Asia/Kolkata', 'DD-MM-YYYY'),
			enddate: '01-04-9999',
			brand_id: 0,
		},
		{
			center_id: Number(insertValues.center_id),
			customer_id: Number(data.id),
			type: insertValues.disctype,
			gst_slab: 18,
			value: insertValues.gsteighteen,
			startdate: currentTimeInTimeZone('Asia/Kolkata', 'DD-MM-YYYY'),
			enddate: '01-04-9999',
			brand_id: 0,
		},
		{
			center_id: Number(insertValues.center_id),
			customer_id: Number(data.id),
			type: insertValues.disctype,
			gst_slab: 28,
			value: insertValues.gsttwentyeight,
			startdate: currentTimeInTimeZone('Asia/Kolkata', 'DD-MM-YYYY'),
			enddate: '01-04-9999',
			brand_id: 0,
		},
	];

	const retVal = await insertCustomerDiscount(taxSlabArr);

	const finalReturnValue = await insertCustomerShippingAddressBlock(insertValues, data.id);

	return finalReturnValue;
};

const insertCustomerBlock = async (insertValues: any) => {
	const result = await prisma.customer.create({
		data: {
			center_id: Number(insertValues.center_id),
			name: insertValues.name,
			address1: insertValues.address1,
			address2: insertValues.address2,
			address3: insertValues.address3,
			district: insertValues.district,
			state_id: Number(insertValues.state_id),
			pin: insertValues.pin,
			gst: insertValues.gst,
			mobile: insertValues.mobile.toString(),
			mobile2: insertValues.mobile2.toString(),
			whatsapp: insertValues.whatsapp.toString(),
			email: insertValues.email,
			createdon: currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss'),
			isactive: 'A',
		},
	});

	return bigIntToString(result);
};

const insertCustomerShippingAddressBlock = async (insertValues: any, customer_id: any) => {
	const result = await prisma.customer_shipping_address.create({
		data: {
			customer_id: Number(customer_id),
			address1: insertValues.address1,
			address2: insertValues.address2,
			address3: insertValues.address3,
			district: insertValues.district,
			state_id: Number(insertValues.state_id),
			pin: insertValues.pin,
			def_address: 'Y',
			is_active: 'A',
		},
	});

	return bigIntToString(result);
};

const updateCustomer = async (updateValues: any, id: any) => {
	const result = await prisma.vendor.update({
		where: {
			id: Number(id),
		},
		data: {
			center_id: updateValues.center_id,
			name: updateValues.name,
			address1: updateValues.address1,
			address2: updateValues.address2,
			address3: updateValues.address3,
			district: updateValues.district,
			state_id: updateValues.state_id,
			pin: updateValues.pin,
			gst: updateValues.gst,
			phone: updateValues.phone,
			mobile: updateValues.mobile,
			mobile2: updateValues.mobile2,
			whatsapp: updateValues.whatsapp,
			email: updateValues.email,
		},
	});
	return bigIntToString(result);
};

// fetch rows from discount tbl
const getCustomerDiscount = async (center_id: any, customer_id: any) => {
	const customerDiscountDetails = await prisma.discount.findMany({
		where: {
			center_id: Number(center_id),
			customer_id: Number(customer_id),
		},
		include: {
			customer: true,
		},
	});

	return customerDiscountDetails;
};

// fetch rows for default (brandid as zero) customer discounts from discount tbl
export const getAllCustomerDefaultDiscounts = async (centerid: any, customer_id: any) => {
	let query = ` 
	SELECT 
	c.name, 'default' as 'brand_name',   d.type, d.brand_id as brand_id, 
     sum(if( d.gst_slab = 0, d.value, 0 ) ) AS gstzero,  
     sum(if( d.gst_slab = 5, d.value, 0 ) ) AS gstfive, 
     sum(if( d.gst_slab = 12, d.value, 0 ) ) AS gsttwelve, 
     sum(if( d.gst_slab = 18, d.value, 0 ) ) AS gsteighteen, 
		 sum(if( d.gst_slab = 28, d.value, 0 ) ) AS gsttwentyeight,
		 c.id as id, d.startdate  
FROM 
	customer c,
    discount d
    where 
    d.brand_id = 0 and
		d.center_id = ? and
    c.id = d.customer_id `;

	if (customer_id !== '') {
		query = query + ` and c.id = ${customer_id} `;
	}
	query =
		query +
		` 
    group by 
    c.name, d.type, d.brand_id, c.id, d.startdate   
    order by
    c.name
	`;

	let values = [centerid];

	return promisifyQuery(query, values);
};

// fetch rows for default (brandid as zero) customer discounts from discount tbl
export const getDiscountsByCustomer = async (centerid: any, customerid: any) => {
	let query = ` 
	SELECT 
	c.name,  '' as 'brand_name',  d.type, d.brand_id as brand_id, 
     sum(if( d.gst_slab = 0, d.value, 0 ) ) AS gstzero,  
     sum(if( d.gst_slab = 5, d.value, 0 ) ) AS gstfive, 
     sum(if( d.gst_slab = 12, d.value, 0 ) ) AS gsttwelve, 
     sum(if( d.gst_slab = 18, d.value, 0 ) ) AS gsteighteen, 
		 sum(if( d.gst_slab = 28, d.value, 0 ) ) AS gsttwentyeight,
		 c.id as id, d.startdate  
FROM 
	customer c,
    discount d
    where 
    d.brand_id = 0 and
		d.center_id = ? and
		c.id = ? and
		d.customer_id = ?
    group by 
    c.name, d.type, d.brand_id,c.id, d.startdate      
    order by
    c.name
	`;

	let values = [centerid, customerid, customerid, customerid];

	return promisifyQuery(query, values);
};

// fetch rows for default (brandid as NON zero) customer discounts from discount tbl
export const getDiscountsByCustomerByBrand = async (centerid: any, customerid: any) => {
	let query = ` 
	SELECT 
	c.name,  b.name as 'brand_name',  d.type, d.brand_id as brand_id, 
     sum(if( d.gst_slab = 0, d.value, 0 ) ) AS gstzero,  
     sum(if( d.gst_slab = 5, d.value, 0 ) ) AS gstfive, 
     sum(if( d.gst_slab = 12, d.value, 0 ) ) AS gsttwelve, 
     sum(if( d.gst_slab = 18, d.value, 0 ) ) AS gsteighteen, 
		 sum(if( d.gst_slab = 28, d.value, 0 ) ) AS gsttwentyeight,
		 c.id as id, d.startdate  
FROM 
	customer c,
    discount d,
    brand b
		where 
		c.id = d.customer_id and
    d.brand_id <> 0 and
		d.brand_id = b.id and
		d.center_id = ? and
		b.center_id = d.center_id and
		d.customer_id = ?
    group by 
    c.name, d.type, d.brand_id, b.name, c.id, d.startdate      
    order by
    c.name, b.name

	`;

	let values = [centerid, customerid];

	return promisifyQuery(query, values);
};

// fetch rows for default (brandid as NON zero) customer discounts from discount tbl
export const getDiscountsByAllCustomerByBrand = (centerid: any, callback: any) => {
	let query = ` 
	SELECT 
	c.name,  b.name as 'brand_name',  d.type, d.brand_id as brand_id, 
     sum(if( d.gst_slab = 0, d.value, 0 ) ) AS gstzero,  
     sum(if( d.gst_slab = 5, d.value, 0 ) ) AS gstfive, 
     sum(if( d.gst_slab = 12, d.value, 0 ) ) AS gsttwelve, 
     sum(if( d.gst_slab = 18, d.value, 0 ) ) AS gsteighteen, 
		 sum(if( d.gst_slab = 28, d.value, 0 ) ) AS gsttwentyeight,
		 c.id as id, d.startdate  
FROM 
	customer c,
    discount d,
    brand b
    where 
    d.brand_id != 0 and
		d.brand_id = b.id and
		d.center_id = ? 
    
    group by 
    c.name, d.type, d.brand_id, b.name, c.id, d.startdate      
    order by
    c.name, b.name

	`;

	let values = [centerid];

	pool.query(query, values, function (err: any, data: any) {
		if (err) return callback(err);
		return callback(null, data);
	});
};

// insert row in discount tbl
const insertCustomerDiscount = async (taxSlabArr: any) => {
	const result = await prisma.discount.createMany({
		data: taxSlabArr,
	});
	return result;
};

// update rows in discount tbl // check
export const updateDefaultCustomerDiscount = async (updateValues: any) => {
	let query = ` 
	UPDATE discount
	SET value = (case when gst_slab = 0 then '${updateValues.gstzero}'
	when gst_slab = 5 then '${updateValues.gstfive}'
	when gst_slab = 12 then '${updateValues.gsttwelve}'
	when gst_slab = 18 then '${updateValues.gsteighteen}'
	when gst_slab = 28 then '${updateValues.gsttwentyeight}'

									end),
									startdate = '${toTimeZone(updateValues.effDiscStDate, 'Asia/Kolkata')}',
			type= '${updateValues.disctype}'
	WHERE 
	brand_id = '${updateValues.brand_id}' and
	center_id = '${updateValues.center_id}' and
	customer_id = '${updateValues.customer_id}'
	`;

	let result = await promisifyQuery(query);

	return result.affectedRows > 0 ? 'true' : 'false';
};

// fetch rows from customer tbl & customer shipping addres tbl
export const getCustomerDetails = async (centerid: any, customerid: any) => {
	let query = `select c.*, s.code,  s.description,
	csa.state_id as csa_state,
	csa.address1 as csa_address1,
	csa.address2 as csa_address2, 
	csa.address3 as csa_address3,
	csa.district as csa_district,
	csa.pin as csa_pin,
	csa.def_address as def_address,
	s1.code as csa_code,
	s1.description as csa_description,
	c.credit_amt
	from 
	customer c,
	state s,
	state s1,
	customer_shipping_address csa  
	where 
	s1.id = csa.state_id and
	s.id = c.state_id and
	csa.customer_id = c.id and
	csa.def_address= 'Y' and
	
	c.id = '${customerid}' and
	c.center_id = '${centerid}' `;

	return new Promise(function (resolve, reject) {
		pool.query(query, function (err: any, data: any) {
			if (err) {
				reject(err);
			}
			resolve(data);
		});
	});
};

// fetch rows from customer tbl & customer shipping addres tbl
export const getSearchCustomers = (centerid: any, searchstr: any) => {
	let query = `
	select c.id, c.center_id, c.name, c.address1, c.address2, c.address3, c.district, s.code, s.description,
	c.pin, c.gst, c.phone, c.mobile, c.mobile2, c.whatsapp,  c.email, c.isactive,
		csa.state_id as csa_state,
csa.address1 as csa_address1,
csa.address2 as csa_address2, 
csa.address3 as csa_address3,
csa.district as csa_district,
csa.pin as csa_pin,
csa.def_address as def_address,
s1.code as csa_code
	from 
	customer c,
	state s,
	state s1,
	customer_shipping_address csa  
	where 
	s1.id = csa.state_id and
	csa.customer_id = c.id and
	csa.def_address = 'Y' and
	c.state_id = s.id and isactive = 'A' and center_id = '${centerid}'  and
	( LOWER(c.name) like LOWER('%${searchstr}%')) 
	limit 50 `;

	let values = [centerid, searchstr];

	return promisifyQuery(query, values);
};

// insert row in customer tbl
export const insertDiscountsByBrands = (insertValues: any, callback: any) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

	let taxSlabArr = [
		{ gstslab: 0, gstvalue: insertValues.gstzero },
		{ gstslab: 5, gstvalue: insertValues.gstfive },
		{ gstslab: 12, gstvalue: insertValues.gsttwelve },
		{ gstslab: 18, gstvalue: insertValues.gsteighteen },
		{ gstslab: 28, gstvalue: insertValues.gsttwentyeight },
	];

	taxSlabArr.forEach((e) => {
		let formObj = {
			center_id: insertValues.center_id,
			customer_id: insertValues.customer_id,
			brand_id: insertValues.brand_id,
			type: insertValues.disctype,
			value: e.gstvalue,
			gst_slab: e.gstslab,
			startdate: toTimeZone(insertValues.effDiscStDate, 'Asia/Kolkata'),
			enddate: '01-04-9999',
		};

		insertCustomerDiscount(formObj);
	});
	return callback(null, '1');
};

// SHIPPING ADDRESS
// fetch rows from customer shipping address tbl
export const getCustomerShippingAddress = async (customer_id: any) => {
	const customerShippingAddress = await prisma.customer_shipping_address.findMany({
		where: {
			is_active: 'A',
			customer_id: Number(customer_id),
		},
		include: {
			state: true,
		},
		orderBy: {
			id: 'desc',
		},
	});

	return customerShippingAddress;
};

export const insertCustomerShippingAddress = async (insertValues: any) => {
	let def_address = insertValues.def_address === true ? 'Y' : 'N';
	let result: any = '';

	if (def_address === 'Y') {
		await updateAllAddress(insertValues);
		result = await addCustomerShippingAddress(insertValues, def_address);

		return { id: result };
	} else {
		result = await addCustomerShippingAddress(insertValues, def_address);

		return { id: result };
	}
};

export const addCustomerShippingAddress = async (insertValues: any, def_address: any) => {
	const result = await prisma.customer_shipping_address.create({
		data: {
			customer_id: Number(insertValues.customer_id),
			address1: insertValues.address1,
			address2: insertValues.address2,
			address3: insertValues.address3,
			district: insertValues.district,
			state_id: insertValues.state_id,
			pin: insertValues.pin,
			def_address: def_address,
			is_active: 'A',
		},
	});

	return bigIntToString(result);
};

export const updateAllAddress = async (insertValues: any) => {
	return updateCSAByCustomerId(insertValues);
};

export const updateCustomerShippingAddress = async (updateValues: any, id: any) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

	if (updateValues.def_address) {
		const data = await updateCSAByCustomerId(updateValues);
		const result = await updateCSAById(updateValues, id);
		return result;
	} else {
		const result = await updateCSAById(updateValues, id);
		return result;
	}
};

export const updateCSAByCustomerId = async (updateValues: any) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

	const result = await prisma.customer_shipping_address.updateMany({
		where: {
			customer_id: Number(updateValues.customer_id),
		},
		data: {
			def_address: 'N',
		},
	});

	return bigIntToString(result);
};

export const updateCSAById = async (updateValues: any, id: any) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

	const result = await prisma.customer_shipping_address.update({
		where: {
			id: Number(id),
		},
		data: {
			address1: updateValues.address1,
			address2: updateValues.address2,
			district: updateValues.district,
			state_id: updateValues.state_id,
			pin: updateValues.pin,
			def_address: updateValues.def_address === true ? 'Y' : 'N',
		},
	});

	return bigIntToString(result);
};

export const inactivateCSA = async (id: any) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

	const result = await prisma.customer_shipping_address.update({
		where: {
			id: Number(id),
		},
		data: {
			is_active: 'I',
		},
	});

	return bigIntToString(result);
};

export const isCustomerExists = async (name: any, center_id: any) => {
	let customerCount = await prisma.customer.count({
		where: {
			name: name,
			center_id: Number(center_id),
		},
	});

	return { result: customerCount };
};

module.exports = {
	getCustomerDiscount,
	insertCustomerDiscount,

	insertCustomer,
	updateCustomer,
	getSearchCustomers,
	getCustomerDetails,
	getAllCustomerDefaultDiscounts,
	getDiscountsByCustomer,
	getDiscountsByCustomerByBrand,
	getDiscountsByAllCustomerByBrand,
	updateDefaultCustomerDiscount,
	insertDiscountsByBrands,

	updateCustomerShippingAddress,
	insertCustomerShippingAddress,
	getCustomerShippingAddress,
	inactivateCSA,
	isCustomerExists,
};
