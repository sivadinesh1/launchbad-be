const express = require('express');
const router = express.Router();
const axios = require('axios');

const { handleError, ErrorHandler } = require('../../config/error');

const { getSearchCustomers } = require('../../services/customers.service');
const { getSearchVendors } = require('../../services/vendors.service');
const { getAllBrands, getBrandsMissingDiscountsByCustomer, getSearchBrands } = require('../../services/brands.service');

// const { createInvoice } = require('./createInvoice.route.js');
var pool = require('../../config/db');

const invoice = {
	shipping: {
		name: 'John Doe',
		address: '1234 Main Street',
		city: 'San Francisco',
		state: 'CA',
		country: 'US',
		postal_code: 94111,
	},
	items: [
		{
			item: 'TC 100',
			description: 'Toner Cartridge',
			quantity: 2,
			amount: 6000,
		},
		{
			item: 'USB_EXT',
			description: 'USB Cable Extender',
			quantity: 1,
			amount: 2000,
		},
	],
	subtotal: 8000,
	paid: 0,
	invoice_nr: 1234,
};

// router.get('/sample-pdf', (req, res) => {
// 	createInvoice(invoice, 'invoice.pdf', res);
// });

router.post('/search-product-information', (req, res) => {
	const [centerid, customerid, orderdate, searchstr] = Object.values(req.body);

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

	pool.query(sql, function (err, data) {
		if (err) {
			return handleError(new ErrorHandler('500', '/search-product-information', err), res);
		} else {
			return res.json(data);
		}
	});
});

router.post('/search-product', (req, res) => {
	const [centerid, searchstr, searchby] = Object.values(req.body);

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

	// old wrong query - can be deleted after etesting ATTN
	// sql = `select a.product_code as product_code, a.description, b.mrp, a.taxrate, b.available_stock,
	// 	a.packetsize, a.unit_price, a.purchase_price as purchase_price, a.id as product_id, b.id as stock_pk, a.packetsize as qty, a.rackno, bd.name,
	// 	bd.id as brand_id, a.unit as uom, a.hsncode as hsncode, a.minqty as minqty, a.avgpurprice as avgpurprice,
	// 	a.unit_price as unit_price, a.salesprice as salesprice,  a.maxdiscount as maxdiscount, a.currentstock as currentstock
	// 	from
	// 	brand bd,
	// 	product a
	// 	LEFT outer JOIN   stock b
	// 	ON b.product_id = a.id
	// 	where
	// 	a.center_id = '${centerid}' and
	// 	a.brand_id = bd.id and
	// 	( a.product_code like '%${searchstr}%' or
	// 	a.description like '%${searchstr}%' ) limit 50
	//  `;

	pool.query(sql, function (err, data) {
		if (err) {
			return handleError(new ErrorHandler('500', '/search-product', err), res);
		} else {
			return res.status(200).json(data);
		}
	});
});

router.post('/search-customer', (req, res) => {
	const [centerid, searchstr] = Object.values(req.body);

	getSearchCustomers(centerid, searchstr, (err, data) => {
		if (err) {
			return handleError(new ErrorHandler('500', '/search-customer', err), res);
		} else {
			return res.status(200).json(data);
		}
	});
});

router.post('/search-vendor', (req, res) => {
	const [centerid, searchstr] = Object.values(req.body);

	getSearchVendors(centerid, searchstr, (err, data) => {
		if (err) {
			return handleError(new ErrorHandler('500', '/search-vendor', err), res);
		} else {
			return res.status(200).json(data);
		}
	});
});

router.post('/search-brand', async (req, res) => {
	const [centerid, searchstr] = Object.values(req.body);
	let rows = await getSearchBrands(centerid, searchstr);
	return res.status(200).json(rows);
});

//mgt
router.get('/inventory/all', (req, res) => {
	let sql = `select p.product_code, p.description, p.mrp, s.available_stock
  from product p, 
       stock s 
  where p.product_code= s.product_code`;

	pool.query(sql, function (err, data) {
		if (err) {
			return handleError(new ErrorHandler('500', '/inventory/all', err), res);
		} else {
			return res.json(data);
		}
	});
});

//mgt
router.get('/all-clients', (req, res) => {
	let sql = `select * from customer where isactive = 'A'`;

	pool.query(sql, function (err, data) {
		if (err) {
			return handleError(new ErrorHandler('500', '/all-clients', err), res);
		} else {
			return res.json(data);
		}
	});
});

//mgt
router.get('/all-active-vendors/:centerid', (req, res) => {
	let centerid = req.params.centerid;

	let sql = `select v.id, v.center_id, v.name, v.address1, v.address2, v.address3, v.district, s.id as state_id, s.code, s.description as state,
	v.pin, v.gst, v.phone, v.mobile, v.mobile2, v.whatsapp, v.email, v.isactive, v.credit_amt,
	v.balance_amt, 
	DATE_FORMAT(v.last_paid_date, '%d-%b-%Y') as last_paid_date
	from 
	vendor v,
	state s
	where 
	v.state_id = s.id and isactive = 'A' and center_id = ${centerid} order by v.name`;

	pool.query(sql, function (err, data) {
		if (err) {
			return handleError(new ErrorHandler('500', `/all-active-vendors/:centerid ${centerid}`, err), res);
		} else {
			res.json(data);
		}
	});
});

// get all active brands
router.get('/all-active-brands/:centerid/:status', (req, res) => {
	getAllBrands(req.params.centerid, req.params.status, (err, rows) => {
		if (err) {
			return handleError(new ErrorHandler('500', `/all-active-brands/:centerid/:status ${req.params.centerid} ${req.params.status}`, err), res);
		} else {
			return res.json(rows);
		}
	});
});

router.get('/vendor-exists/:name/:center_id', (req, res) => {
	let name = req.params.name;
	let center_id = req.params.center_id;

	let sql = `select * from vendor v where 
	v.name = '${name}' and center_id = '${center_id}' `;

	pool.query(sql, function (err, data) {
		if (err) {
			return handleError(new ErrorHandler('500', `/vendor-exists/:name/:center_id ${name} ${center_id}`, err), res);
		} else {
			return res.status(200).json({
				result: data,
			});
		}
	});
});

router.get('/brand-exists/:name/:center_id', (req, res) => {
	let name = req.params.name;
	let center_id = req.params.center_id;

	let sql = `select * from brand b where 
	b.name = '${name}' and b.center_id = '${center_id}' `;

	pool.query(sql, function (err, data) {
		if (err) {
			return handleError(new ErrorHandler('500', `/brand-exists/:name/:center_id ${name} ${center_id}`, err), res);
		} else {
			return res.status(200).json({
				result: data,
			});
		}
	});
});

router.get('/customer-exists/:name/:centerid', (req, res) => {
	let name = req.params.name;
	let center_id = req.params.centerid;

	let sql = `select * from customer c where 
	c.name = '${name}' and center_id = ${center_id} `;

	pool.query(sql, function (err, data) {
		if (err) {
			return handleError(new ErrorHandler('500', `/customer-exists/:name ${name} ${center_id}`, err), res);
		} else {
			return res.status(200).json({
				result: data,
			});
		}
	});
});

router.get('/brand-delete/:id', (req, res) => {
	let id = req.params.id;

	let sql = `update brand set isactive = 'D' where id = '${id}' `;

	pool.query(sql, function (err, data) {
		if (err) {
			return handleError(new ErrorHandler('500', `/brand-delete/:id ${id}`, err), res);
		} else {
			return res.status(200).json({
				result: data,
			});
		}
	});
});

router.get('/enquiry-delete/:id', (req, res) => {
	let id = req.params.id;

	let sql = `update enquiry set estatus = 'X' where id = '${id}' `;

	pool.query(sql, function (err, data) {
		if (err) {
			return handleError(new ErrorHandler('500', `/enquiry-delete/:id ${id}`, err), res);
		} else {
			return res.status(200).json({
				result: data,
			});
		}
	});
});

router.get('/vendor-delete/:id', (req, res) => {
	let id = req.params.id;

	let sql = `update vendor set isactive = 'D' where id = '${id}' `;

	pool.query(sql, function (err, data) {
		if (err) {
			return handleError(new ErrorHandler('500', `/vendor-delete/:id ${id}`, err), res);
		} else {
			return res.status(200).json({
				result: data,
			});
		}
	});
});

// get all active brands
router.get('/brands-missing-discounts/:centerid/:status/:customerid', (req, res) => {
	getBrandsMissingDiscountsByCustomer(req.params.centerid, req.params.status, req.params.customerid, (err, rows) => {
		if (err) {
			return handleError(
				new ErrorHandler(
					'500',
					`/brands-missing-discounts/:centerid/:status/:customerid ${req.params.centerid} ${req.params.status} ${req.params.customerid}`,
					err,
				),
				res,
			);
		} else {
			return res.json(rows);
		}
	});
});

router.get('/all-active-customers/:centerid', (req, res) => {
	let centerid = req.params.centerid;

	let sql = `select c.id, c.center_id, c.name, c.address1, c.address2, c.district, s.id as state_id, s.code, s.description,
	c.pin, c.gst, c.phone, c.mobile, c.mobile2, c.whatsapp, c.email, 
	c.isactive, c.credit_amt as credit_amt, c.balance_amt as balance_amt, 
	DATE_FORMAT(c.last_paid_date, '%d-%b-%Y') as last_paid_date
	from 
	customer c,
	state s
	where 
	c.state_id = s.id and isactive = 'A' and center_id = ${centerid} 	order by name `;

	pool.query(sql, function (err, data) {
		if (err) {
			return handleError(new ErrorHandler('500', `/all-active-customers/:centerid ${centerid}`, err), res);
		} else {
			return res.json(data);
		}
	});
});

router.post('/add-parts-details-enquiry', (req, res) => {
	let yourJsonObj = req.body;

	var objectKeysArray = Object.keys(yourJsonObj);
	objectKeysArray.forEach(function (objKey) {
		var objValue = yourJsonObj[objKey];

		let query = `INSERT INTO enquiry_detail ( enquiry_id, item_code, qty) values ( '${objValue.enquiryid}','${objValue.partno}','${objValue.quantity}')`;

		pool.query(query, function (err, data) {
			if (err) {
				return handleError(new ErrorHandler('500', '/add-parts-details-enquiry', err), res);
			}
		});
	});
});

module.exports = router;

router.get('/get-enquiry/:enquiryid', (req, res) => {
	let enquiryid = req.params.enquiryid;

	let sql = `select * 
  from 
  enquiry_detail ed,
  enquiry em, 
  parts p
  where
  ed.partno = p.partno and
  em.id = ed.enquiry_id and
  ed.enquiry_id = ${enquiryid}
  `;

	pool.query(sql, function (err, data) {
		if (err) {
			return handleError(new ErrorHandler('500', `/get-enquiry/:enquiryid ${enquiryid}`, err), res);
		} else {
			return res.json(data);
		}
	});
});

router.get('/get-customer-details/:enquiryid', (req, res) => {
	let enquiryid = req.params.enquiryid;

	let sql = `     select c.*
  from 
  enquiry em, 
customer c
where
em.customer_id = c.id and
em.id = ${enquiryid}`;

	pool.query(sql, function (err, data) {
		if (err) {
			return handleError(new ErrorHandler('404', `/get-customer-details/:enquiryid ${enquiryid}`, err), res);
		} else {
			return res.json(data);
		}
	});
});

router.post('/update-taxrate', (req, res) => {
	let taxrate = req.body.taxrate;
	let id = req.body.productid;

	let query = `update product 
	set 
	taxrate = '${taxrate}' 
	where id = '${id}' `;

	pool.query(query, function (err, data) {
		if (err) {
			return handleError(new ErrorHandler('500', '/update-taxrate', err), res);
		} else {
		}
	});
});
// error check
router.get('/purchase/:purchaseid/:status', (req, res) => {
	try {
		let centerid = req.params.centerid;

		let sql = `select c.id, c.center_id, c.name, c.address1, c.address2, c.district, s.code, s.description,
	c.pin, c.gst, c.phone, c.mobile, c.mobile2, c.whatsapp, c.email, c.isactive  from 
	customer c,
	state s
	where 
	c.state_id = s.id and isactive = 'A' and center_id = ${centerid}`;

		pool.query(sql, function (err, data) {
			if (err) {
				return handleError(new ErrorHandler('500', `/purchase/:purchaseid/:status ${centerid}`, err), res);
			} else {
				res.json(data);
			}
		});
	} catch (error) {
		return handleError(new ErrorHandler('500', 'Error processing request', err), res);
	}
});

//mgt
router.get('/all-pymt-modes/:center_id/:status', (req, res) => {
	let sql = `select * from payment_mode where center_id = '${req.params.center_id}' and is_active = '${req.params.status}'`;

	pool.query(sql, function (err, data) {
		if (err) {
			return handleError(new ErrorHandler('500', `/all-pymt-modes/:center_id/:status ${req.params.center_id} ${req.params.status}`, err), res);
		} else {
			return res.json(data);
		}
	});
});

router.get('/all-meetings', (req, res) => {
	let data = 'dinesh';
	const access_token =
		'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6ImtFTFlKRWRkUmlPMV93bDc2czFEbkEiLCJleHAiOjE2MjEwNjA4OTIsImlhdCI6MTYyMDQ1NjA5M30.KIcNG45pta74WMsdjchQrrmW1Akb-AGT06-HUvrSQx8';

	axios
		.get('https://api.zoom.us/v2/users/sivadinesh@squapl.com/meetings', {
			headers: {
				Authorization: `Bearer ${access_token}`,
			},
		})
		.then((res) => {
			console.log(res.data);
		})
		.catch((error) => {
			console.error(error);
		});
});

router.post('/create-meeting', (req, res) => {
	const url = `https://api.zoom.us/v2/users/sivadinesh@squapl.com/meetings`;

	const access_token =
		'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6ImtFTFlKRWRkUmlPMV93bDc2czFEbkEiLCJleHAiOjE2MjEwNjA4OTIsImlhdCI6MTYyMDQ1NjA5M30.KIcNG45pta74WMsdjchQrrmW1Akb-AGT06-HUvrSQx8';

	axios
		.post(
			url,
			{
				topic: 'Test Meeting',
				start_time: '2021-06-05T18:00:00Z',
				type: 3,
				duration: 20,
				timezone: 'Asia/Calcutta',
				agenda: 'Testing the Url',
			},
			{
				headers: {
					Authorization: `Bearer ${access_token}`,
				},
			},
		)
		.then((res) => {
			console.log(res.data);
		})
		.catch((error) => {
			console.error(error);
		});
});

// axios.post(url, {
//   //...data
// }, {
//   headers: {
//     'Authorization': `Basic ${token}`
//   }
// })
