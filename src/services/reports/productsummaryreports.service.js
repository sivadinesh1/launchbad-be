var pool = require('../../config/db');
const { toTimeZone, currentTimeInTimeZone, toTimeZoneFrmt, promisifyQuery } = require('../../utils/utils');

const getProductSummaryReport = (requestBody) => {
	const [center_id, start, end] = Object.values(requestBody);

	let query = `
  select p.id as id, c.name as center_name, b.name as brandname, p.product_code as code, p.description as description, p.hsncode as hsncode, p.unit as unit, p.packetsize as packetsize, p.unit_price as unit_price, 
s.available_stock as available_stock, s.mrp as mrp, p.taxrate as tax_rate, 
s.open_stock as open_stock, p.rackno as rakno,
s.updateddate as last_updated
from 
product p,
brand b,
stock s,
center c
where
c.id = p.center_id and
p.brand_id = b.id and
p.id = s.product_id and
p.center_id = '${center_id}' 
order by p.id
limit ${start}, ${end}
  `;

	return promisifyQuery(query);
};

module.exports = {
	getProductSummaryReport,
};
