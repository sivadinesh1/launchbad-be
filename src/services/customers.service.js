const { prisma } = require('../config/prisma');
var pool = require('../config/db');

const { toTimeZoneFormat, currentTimeInTimeZone, promisifyQuery, bigIntToString } = require('../utils/utils');

// insert row in customer tbl
const insertCustomer = async (insertValues) => {
	const data = await insertCustomerBlock(insertValues);

	let taxSlabArr = [
		{
			center_id: Number(insertValues.center_id),
			customer_id: Number(data.id),
			type: insertValues.disc_type,
			gst_slab: 0,
			value: insertValues.gst_zero,
			start_date: new Date(currentTimeInTimeZone('YYYY-MM-DD')),
			end_date: new Date('9999-04-01'),
			brand_id: 0,
			created_by: Number(insertValues.created_by),
			updated_by: Number(insertValues.updated_by)
		},
		{
			center_id: Number(insertValues.center_id),
			customer_id: Number(data.id),
			type: insertValues.disc_type,
			gst_slab: 5,
			value: insertValues.gst_five,
			start_date: new Date(currentTimeInTimeZone('YYYY-MM-DD')),
			end_date: new Date('9999-04-01'),
			brand_id: 0,
			created_by: Number(insertValues.created_by),
			updated_by: Number(insertValues.updated_by)
		},
		{
			center_id: Number(insertValues.center_id),
			customer_id: Number(data.id),
			type: insertValues.disc_type,
			gst_slab: 12,
			value: insertValues.gst_twelve,
			start_date: new Date(currentTimeInTimeZone('YYYY-MM-DD')),
			end_date: new Date('9999-04-01'),
			brand_id: 0,
			created_by: Number(insertValues.created_by),
			updated_by: Number(insertValues.updated_by)
		},
		{
			center_id: Number(insertValues.center_id),
			customer_id: Number(data.id),
			type: insertValues.disc_type,
			gst_slab: 18,
			value: insertValues.gst_eighteen,
			start_date: new Date(currentTimeInTimeZone('YYYY-MM-DD')),
			end_date: new Date('9999-04-01'),
			brand_id: 0,
			created_by: Number(insertValues.created_by),
			updated_by: Number(insertValues.updated_by)
		},
		{
			center_id: Number(insertValues.center_id),
			customer_id: Number(data.id),
			type: insertValues.disc_type,
			gst_slab: 28,
			value: insertValues.gst_twenty_eight,
			start_date: new Date(currentTimeInTimeZone('YYYY-MM-DD')),
			end_date: new Date('9999-04-01'),
			brand_id: 0,
			created_by: Number(insertValues.created_by),
			updated_by: Number(insertValues.updated_by)
		},
	];

	const retVal = await insertCustomerDiscount(taxSlabArr);

	const finalReturnValue = await insertCustomerShippingAddressBlock(insertValues, data.id);

	return finalReturnValue;
};

const insertCustomerBlock = async (insertValues) => {
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

			is_active: 'A',
		},
	});

	return bigIntToString(result);
};

const insertCustomerShippingAddressBlock = async (insertValues, customer_id) => {
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

const updateCustomer = async (updateValues, id) => {
	const result = await prisma.vendor.update({
		where: {
			id: Number(id),
		},
		data: {
			center_id: updateValues.center_id,
			vendor_name: updateValues.vendor_name,
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
const getCustomerDiscount = async (center_id, customer_id) => {
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

// fetch rows for default (brand id as zero) customer discounts from discount tbl
const getAllCustomerDefaultDiscounts = async (center_id, customer_id) => {
	let query = ` 
	SELECT 
	c.name, 'default' as 'brand_name',   d.type, d.brand_id as brand_id, 
     sum(if( d.gst_slab = 0, d.value, 0 ) ) AS gst_zero,  
     sum(if( d.gst_slab = 5, d.value, 0 ) ) AS gst_five, 
     sum(if( d.gst_slab = 12, d.value, 0 ) ) AS gst_twelve, 
     sum(if( d.gst_slab = 18, d.value, 0 ) ) AS gst_eighteen, 
		 sum(if( d.gst_slab = 28, d.value, 0 ) ) AS gst_twenty_eight,
		 c.id as id, d.start_date  
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
    c.name, d.type, d.brand_id, c.id, d.start_date   
    order by
    c.name
	`;

	let values = [center_id];

	return promisifyQuery(query, values);
};

// fetch rows for default (brand id as zero) customer discounts from discount tbl
const getDiscountsByCustomer = async (center_id, customer_id) => {
	let query = ` 
	SELECT 
	c.name,  '' as 'brand_name',  d.type, d.brand_id as brand_id, 
     sum(if( d.gst_slab = 0, d.value, 0 ) ) AS gst_zero,  
     sum(if( d.gst_slab = 5, d.value, 0 ) ) AS gst_five, 
     sum(if( d.gst_slab = 12, d.value, 0 ) ) AS gst_twelve, 
     sum(if( d.gst_slab = 18, d.value, 0 ) ) AS gst_eighteen, 
		 sum(if( d.gst_slab = 28, d.value, 0 ) ) AS gst_twenty_eight,
		 c.id as id, d.start_date  
FROM 
	customer c,
    discount d
    where 
    d.brand_id = 0 and
		d.center_id = ? and
		c.id = ? and
		d.customer_id = ?
    group by 
    c.name, d.type, d.brand_id,c.id, d.start_date      
    order by
    c.name
	`;

	let values = [center_id, customer_id, customer_id, customer_id];

	return promisifyQuery(query, values);
};

// fetch rows for default (brand id as NON zero) customer discounts from discount tbl
const getDiscountsByCustomerByBrand = async (center_id, customer_id) => {
	let query = ` 
	SELECT 
	c.name,  b.brand_name as 'brand_name',  d.type, d.brand_id as brand_id, 
     sum(if( d.gst_slab = 0, d.value, 0 ) ) AS gst_zero,  
     sum(if( d.gst_slab = 5, d.value, 0 ) ) AS gst_five, 
     sum(if( d.gst_slab = 12, d.value, 0 ) ) AS gst_twelve, 
     sum(if( d.gst_slab = 18, d.value, 0 ) ) AS gst_eighteen, 
		 sum(if( d.gst_slab = 28, d.value, 0 ) ) AS gst_twenty_eight,
		 c.id as id, d.start_date  
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
    c.name, d.type, d.brand_id, b.brand_name, c.id, d.start_date      
    order by
    c.name, b.brand_name

	`;

	let values = [center_id, customer_id];

	return promisifyQuery(query, values);
};

// fetch rows for default (brand_id as NON zero) customer discounts from discount tbl
const getDiscountsByAllCustomerByBrand = (center_id) => {
	let query = ` 
	SELECT 
	c.name,  b.brand_name as 'brand_name',  d.type, d.brand_id as brand_id, 
     sum(if( d.gst_slab = 0, d.value, 0 ) ) AS gst_zero,  
     sum(if( d.gst_slab = 5, d.value, 0 ) ) AS gst_five, 
     sum(if( d.gst_slab = 12, d.value, 0 ) ) AS gst_twelve, 
     sum(if( d.gst_slab = 18, d.value, 0 ) ) AS gst_eighteen, 
		 sum(if( d.gst_slab = 28, d.value, 0 ) ) AS gst_twenty_eight,
		 c.id as id, d.start_date  
FROM 
	customer c,
    discount d,
    brand b
    where 
    d.brand_id != 0 and
		d.brand_id = b.id and
		d.center_id = ? 
    
    group by 
    c.name, d.type, d.brand_id, b.brand_name, c.id, d.start_date      
    order by
    c.name, b.brand_name

	`;

	let values = [center_id];

	return promisifyQuery(query, values);


};

// insert row in discount tbl
const insertCustomerDiscount = async (taxSlabArr) => {
	const result = await prisma.discount.createMany({
		data: taxSlabArr,
	});
	return result;
};

// update rows in discount tbl // check
const updateDefaultCustomerDiscount = async (updateValues) => {
	let query = ` 
	UPDATE discount
	SET value = (case when gst_slab = 0 then '${updateValues.gst_zero}'
	when gst_slab = 5 then '${updateValues.gst_five}'
	when gst_slab = 12 then '${updateValues.gst_twelve}'
	when gst_slab = 18 then '${updateValues.gst_eighteen}'
	when gst_slab = 28 then '${updateValues.gst_twenty_eight}'

									end),
									start_date = '${toTimeZoneFormat(updateValues.effDiscStDate, 'YYYY-MM-DD')}',
			type= '${updateValues.disc_type}'
	WHERE 
	brand_id = '${updateValues.brand_id}' and
	center_id = '${updateValues.center_id}' and
	customer_id = '${updateValues.customer_id}'
	`;

	let result = await promisifyQuery(query);

	return result.affectedRows > 0 ? 'true' : 'false';
};

// fetch rows from customer tbl & customer shipping address tbl
const getCustomerDetails = async (center_id, customer_id) => {
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
	
	c.id = '${customer_id}' and
	c.center_id = '${center_id}' `;

	return new Promise(function (resolve, reject) {
		pool.query(query, function (err, data) {
			if (err) {
				reject(err);
			}
			resolve(data);
		});
	});
};

// fetch rows from customer tbl & customer shipping address tbl
const getSearchCustomers = (center_id, search_text) => {
	let query = `
	select c.id, c.center_id, c.name, c.address1, c.address2, c.address3, c.district, s.code, s.description,
	c.pin, c.gst, c.phone, c.mobile, c.mobile2, c.whatsapp,  c.email, c.is_active,
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
	c.state_id = s.id and c.is_active = 'A' and c.center_id = '${center_id}'  and
	( LOWER(c.name) like LOWER('%${search_text}%')) 
	limit 50 `;

	return promisifyQuery(query);
};

// insert row in customer tbl
const insertDiscountsByBrands = (insertValues) => {
	let today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');

	let taxSlabArr = [
		{ gst_slab: 0, gst_value: insertValues.gst_zero },
		{ gst_slab: 5, gst_value: insertValues.gst_five },
		{ gst_slab: 12, gst_value: insertValues.gst_twelve },
		{ gst_slab: 18, gst_value: insertValues.gst_eighteen },
		{ gst_slab: 28, gst_value: insertValues.gst_twenty_eight },
	];

	taxSlabArr.forEach(async (e) => {
		let formObj = {
			center_id: Number(insertValues.center_id),
			customer_id: Number(insertValues.customer_id),
			brand_id: Number(insertValues.brand_id),
			type: insertValues.disc_type,
			value: e.gst_value,
			gst_slab: e.gst_slab,
			
			start_date: new Date(currentTimeInTimeZone('YYYY-MM-DD')),
			end_date: new Date('9999-04-01'),
		};

		await insertCustomerDiscount(formObj);
	});
	return "success";
};

// SHIPPING ADDRESS
// fetch rows from customer shipping address tbl
const getCustomerShippingAddress = async (customer_id) => {
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

const insertCustomerShippingAddress = async (insertValues) => {
	let def_address = insertValues.def_address === true ? 'Y' : 'N';
	let result = '';

	if (def_address === 'Y') {
		await updateAllAddress(insertValues);
		result = await addCustomerShippingAddress(insertValues, def_address);

		return { id: result };
	} else {
		result = await addCustomerShippingAddress(insertValues, def_address);

		return { id: result };
	}
};

const addCustomerShippingAddress = async (insertValues, def_address) => {
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

const updateAllAddress = async (insertValues) => {
	return updateCSAByCustomerId(insertValues);
};

const updateCustomerShippingAddress = async (updateValues, id) => {
	let today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');

	if (updateValues.def_address) {
		const data = await updateCSAByCustomerId(updateValues);
		const result = await updateCSAById(updateValues, id);
		return result;
	} else {
		const result = await updateCSAById(updateValues, id);
		return result;
	}
};

const updateCSAByCustomerId = async (updateValues) => {
	let today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');

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

const updateCSAById = async (updateValues, id) => {
	let today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');

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

const inactivateCSA = async (id) => {
	let today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');

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

const isCustomerExists = async (name, center_id) => {
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
