const { prisma } = require('../config/prisma');
var pool = require('../config/db');

const { currentTimeInTimeZone, bigIntToString, escapeText, promisifyQuery } = require('../utils/utils');

const vendorRepoAddVendor = async (vendor) => {
	try {
		const result = await prisma.vendor.create({
			data: {
				center_id: Number(vendor.center_id),
				vendor_name: vendor.vendor_name,
				address1: vendor.address1,
				address2: vendor.address2,
				address3: vendor.address3,
				district: vendor.district,
				state_id: Number(vendor.state_id),
				pin: vendor.pin,
				gst: vendor.gst,
				phone: vendor.phone.toString(),
				mobile: vendor.mobile.toString(),
				mobile2: vendor.mobile2.toString(),
				whatsapp: vendor.whatsapp.toString(),
				email: vendor.email,
				is_active: 'A',
			},
		});

		return bigIntToString(result);
	} catch (error) {
		console.log('error :: vendor.repo.js ' + error);
		throw error;
	}
};

const vendorRepoUpdateVendor = async (vendor) => {
	try {
		const result = await prisma.vendor.update({
			where: {
				id: Number(vendor.id),
			},
			data: {
				center_id: Number(vendor.center_id),
				vendor_name: vendor.vendor_name,
				address1: vendor.address1,
				address2: vendor.address2,
				address3: vendor.address3,
				district: vendor.district,
				state_id: Number(vendor.state_id),
				pin: vendor.pin,
				gst: vendor.gst,
				phone: vendor.phone.toString(),
				mobile: vendor.mobile.toString(),
				mobile2: vendor.mobile2.toString(),
				whatsapp: vendor.whatsapp.toString(),
				email: vendor.email,
				is_active: 'A',
			},
		});

		return bigIntToString(result);
	} catch (error) {
		console.log('error :: vendor.repo.js ' + error);
		throw error;
	}
};

const vendorRepoSearchVendors = async (center_id, search_text) => {
	try {
		const filteredVendors = await prisma.vendor.findMany({
			take: 50,
			where: {
				center_id: Number(center_id),
				is_active: 'A',
				vendor_name: {
					contains: search_text,
				},
			},
			include: {
				state: true,
			},
		});

		return bigIntToString(filteredVendors);
	} catch (error) {
		console.log('error :: vendor.repo.js ' + error);
		throw error;
	}
};

// const vendorRepoSearchVendors = (centerid, searchstr) => {
// 	let query = `
// 	select v.id, v.center_id, v.vendor_name as name, v.address1, v.address2, v.district,
// 	v.pin, v.gst, v.phone, v.mobile, v.mobile2, v.whatsapp,  v.email, v.is_active, s.code as code
// 	from
// 	vendor v,
// 	state s
// 	where
// 	v.state_id = s.id and is_active = 'A' and center_id = '${centerid}' and
// 	( LOWER(v.vendor_name) like LOWER('%${searchstr}%'))
// 	limit 50  `;

// 	let values = [centerid, searchstr];

// 	return promisifyQuery(query);
// };

const vendorRepoGetVendorDetails = async (center_id, vendor_id) => {
	try {
		const vendorDetails = await prisma.vendor.findMany({
			where: {
				center_id: Number(center_id),
				id: Number(vendor_id),
			},
			include: {
				state: true,
			},
			orderBy: {
				vendor_name: 'asc',
			},
		});

		return bigIntToString(vendorDetails);
	} catch (error) {
		console.log('error :: vendor.repo.js ' + error);
		throw error;
	}
};

const vendorRepoIsVendorExists = async (vendor_name, center_id) => {
	let vendorCount = await prisma.vendor.count({
		where: {
			vendor_name: vendor_name,
			center_id: Number(center_id),
		},
	});

	return { result: vendorCount };
};

const vendorRepoDeleteVendor = async (id) => {
	const result = await prisma.vendor.update({
		where: {
			id: Number(id),
		},
		data: {
			is_active: 'D',
		},
	});

	return bigIntToString(result);
};

const updateVendorBalance = async (vendor_id, balance_amt, prisma) => {
	const result = await prisma.vendor.update({
		where: {
			id: Number(vendor_id),
		},
		data: {
			balance_amt: balance_amt,
		},
	});

	return bigIntToString(result);
};

module.exports = {
	vendorRepoAddVendor,
	vendorRepoUpdateVendor,
	vendorRepoSearchVendors,
	vendorRepoGetVendorDetails,
	vendorRepoIsVendorExists,
	vendorRepoDeleteVendor,
	updateVendorBalance,
};
