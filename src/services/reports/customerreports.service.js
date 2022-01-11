var pool = require('../../config/db');
const {
	currentTimeInTimeZone,
	toTimeZoneFormat,
	promisifyQuery,
} = require('../../utils/utils');

const getCustomerBalanceReports = (
	center_id,
	customer_id,
	asOn,
	invoice_type,
	order
) => {
	// let end_date = toTimeZoneFormat(end, 'YYYY-MM-DD') + ' 23:59:59';

	let end_date;

	if (asOn === 'today') {
		end_date = currentTimeInTimeZone();
	}

	let query = `
						select id, name , district, sum(invcd +  pymnt_rcvd*-1) as balance
						From 
						(
						select c2.id, c2.name , c2.district , IFNULL( sum(s.net_total),0) invcd, '0' pymnt_rcvd
						from sale s , customer c2 
						where s.center_id = '${center_id}'
						and s.status = 'C'
						and s.invoice_type = '${invoice_type}' `;

	if (customer_id !== 'all') {
		query = query + ` and s.customer_id = '${customer_id}' `;
	}

	query =
		query +
		` and c2.center_id = s.center_id 
						and c2.id = s.customer_id `;

	query =
		query +
		`	and s.invoice_date <= STR_TO_DATE('${end_date}','%Y-%m-%d')
						group by c2.id,c2.name , c2.district 
						UNION 
						select c2.id,c2.name , c2.district,'0' invcd, IFNULL(sum(p2.payment_now_amt ),0) pymnt_rcvd
						from payment p2 , customer c2 
						where p2.center_id = '${center_id}' `;

	if (customer_id !== 'all') {
		query = query + ` and p2.customer_id = '${customer_id}' `;
	}

	query =
		query +
		`
					and c2.center_id = p2.center_id 
					and c2.id = p2.customer_id `;

	query =
		query +
		` and  p2.payment_date <= STR_TO_DATE('${end_date}','%Y-%m-%d') 	`;

	query =
		query +
		` GROUP by c2.id,c2.name , c2.district
					) a 
					group by id, name , district
					order by balance ${order}

		 `;

	return promisifyQuery(query);
};

module.exports = {
	getCustomerBalanceReports,
};
