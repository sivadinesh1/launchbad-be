var pool = require('../config/db');

const {
	currentTimeInTimeZone,
	toTimeZoneFormat,
	promisifyQuery,
} = require('../utils/utils');

const moment = require('moment');

const { handleError, ErrorHandler } = require('../config/error');

// ***** NEW ******* //

const getPaymentsReceived = (
	center_id,
	customer_id,
	from_date,
	to_date,
	invoice_no,
	order
) => {
	// 	customer_id: "all"
	// from_date: ""
	// invoice_no: ""
	// order: "desc"
	// to_date: ""

	if (from_date !== '') {
		from_date = toTimeZoneFormat(from_date, 'YYYY-MM-DD') + ' 00:00:00';
	}

	if (to_date !== '') {
		to_date = toTimeZoneFormat(to_date, 'YYYY-MM-DD') + ' 23:59:00';
	}

	let customer_sql = ` and s.customer_id = '${customer_id}' `;

	let query = `
	select 
		p.payment_date as payment_date,
		p.payment_no as payment_no,
		p.id, p.center_id,
		cn.name as center_name,
		cn.address1 as center_address_1,
		cn.address2 as center_address_2,
		cn.district as center_district,
		cn.gst as center_gst,
		c.name as customer_name,
		c.id as customer_id,
		GROUP_CONCAT(pd.sale_ref_id SEPARATOR ',') as invoice_id,
		GROUP_CONCAT(concat(pd.sale_ref_id,'~',s.invoice_no) SEPARATOR ',') as invoice_no,
		GROUP_CONCAT(s.invoice_no SEPARATOR ',') as invoice_no_xls,
		payment_mode_name as payment_mode_name,
		p.payment_now_amt as amount_payed,
		p.advance_amt_used as unused_amount
 from 
		payment p,
		payment_detail pd,
		sale s,
		customer c,
		payment_mode pm,
		center cn 
	where
	cn.id = p.center_id and
		pm.id = p.payment_mode_ref_id and
		c.id = p.customer_id and
		p.id = pd.payment_ref_id and
		pd.sale_ref_id = s.id 
		and p.center_id = ${center_id} and
		p.payment_date between '${from_date}' and '${to_date}' `;

	if (invoice_no !== '') {
		query = query + ` and s.invoice_no = '${invoice_no}' `;
	}

	// filter by customer
	if (customer_id !== 'all') {
		query = query + customer_sql;
	}

	query =
		query +
		`
	group by
		p.id
	order by payment_date ${order}
	`;

	return promisifyQuery(query);
};

const getPaymentsReceivedDetails = (payment_id) => {
	let query = `
		select pd.payment_ref_id as payment_id,
		s.id as sale_id,
		s.invoice_no as sale_invoice_no,
		s.invoice_date as sale_invoice_date,
		s.net_total as invoice_amount,
		pd.applied_amount as paid_amount
		from 
		payment p,
		payment_detail pd,
		sale s
		where
		s.id = pd.sale_ref_id and
		p.id = pd.payment_ref_id and
		p.id = '${payment_id}'
	`;

	return promisifyQuery(query);
};

const getEditPaymentsData = (payment_id) => {
	let query = `
	select 
		p.payment_date as payment_date,
		p.payment_no as payment_no,
		p.id, p.center_id,
		cn.name as center_name,
		cn.address1 as center_address_1,
		cn.address2 as center_address_2,
		cn.district as center_district,
		cn.gst as center_gst,
		c.name as customer_name,
		c.id as customer_id,
		GROUP_CONCAT(pd.sale_ref_id SEPARATOR ',') as invoice_id,
		GROUP_CONCAT(concat(pd.sale_ref_id,'~',s.invoice_no) SEPARATOR ',') as invoice_no,
		GROUP_CONCAT(s.invoice_no SEPARATOR ',') as invoice_no_xls,
		payment_mode_name as payment_mode_name,
		p.payment_now_amt as amount_payed,
		p.advance_amt_used as unused_amount
 from 
		payment p,
		payment_detail pd,
		sale s,
		customer c,
		payment_mode pm,
		center cn 
	where
	cn.id = p.center_id and
		pm.id = p.payment_mode_ref_id and
		c.id = p.customer_id and
		p.id = pd.payment_ref_id and
		pd.sale_ref_id = s.id 
		and p.id = '${payment_id}' `;

	let payment_master = promisifyQuery(query);

	let payment_details = getPaymentsReceivedDetails(payment_id);

	return Promise.all([payment_master, payment_details]);
};

const getPendingReceivables = (
	center_id,
	customer_id,
	from_date,
	to_date,
	invoice_no,
	order
) => {
	let customer_sql = ` and s.customer_id = '${customer_id}' `;

	let query = `
	select s.id as sale_ref_id, s.invoice_date as invoice_date, s.invoice_no as invoice_no, 
s.net_total as invoice_amount,
c.name as customer_name,
c.id as customer_id,
((select invoice_amount) -  sum(pd.applied_amount)) as balance_due,
DATEDIFF(CURDATE(), s.invoice_date) as aging_days,
c.credit_amt 
from 
sale s,
customer c,
payment_detail pd

where
c.id = s.customer_id and
s.payment_status in ('N', 'P')
 and
 pd.sale_ref_id = s.id and
s.center_id = ${center_id} and
s.invoice_date between '${from_date}' and '${to_date}' `;

	if (invoice_no !== '') {
		query = query + ` and s.invoice_no = '${invoice_no}' `;
	}

	// filter by customer
	if (customer_id !== 'all') {
		query = query + customer_sql;
	}

	query =
		query +
		`
group by
sale_ref_id
order by aging_days ${order}
`;

	return promisifyQuery(query);
};

const getPendingInvoices = (center_id, customer_id) => {
	let query = `
			SELECT *, T1.invoice_amt - T1.paid_amount 'bal_amount', 0 as now_paying FROM 
				(	
			SELECT 
				s.invoice_date as invoice_date, 
				c.id as customer_id,
				s.id as sale_id,
				s.invoice_no as invoice_no, 
				s.invoice_type as invoice_type, 
				s.net_total as invoice_amt, 
				IFNULL(
				(SELECT SUM(pd.applied_amount) 
					FROM payment_detail pd 
					WHERE pd.sale_ref_id=s.id 
					GROUP BY pd.sale_ref_id),0) 'paid_amount'
				FROM 
				sale s, 
				customer c
				WHERE s.center_id = '${center_id}'	and
				c.id = s.customer_id and
				c.id = '${customer_id}' ) AS T1
			WHERE T1.invoice_amt - T1.paid_amount > 0 
			ORDER BY 2,1 desc `;

	// #AND T1.SaleType='stockissue' # stockissue / gstinvoice

	return promisifyQuery(query);
};

const getExcessPaidPayments = (customer_id) => {
	let query = `
	select * 
from 
payment p
where
p.customer_id = '${customer_id}' and
p.excess_amount != '0.00' or
p.excess_amount != null
order by 
id 		
	`;

	// #AND T1.SaleType='stockissue' # stockissue / gstinvoice

	return promisifyQuery(query);
};

module.exports = {
	getPaymentsReceived,
	getPaymentsReceivedDetails,
	getEditPaymentsData,
	getPendingInvoices,
	getPendingReceivables,
	getExcessPaidPayments,
};
