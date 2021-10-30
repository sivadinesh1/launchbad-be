const { prisma } = require('../config/prisma');

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
				state_id: vendor.state_id,
				pin: vendor.pin,
				gst: vendor.gst,
				phone: vendor.phone,
				mobile: vendor.mobile,
				mobile2: vendor.mobile2,
				whatsapp: vendor.whatsapp,
				email: vendor.email,
				is_active: vendor.is_active,
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
				state_id: vendor.state_id,
				pin: vendor.pin,
				gst: vendor.gst,
				phone: vendor.phone,
				mobile: vendor.mobile,
				mobile2: vendor.mobile2,
				whatsapp: vendor.whatsapp,
				email: vendor.email,
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
		// console.log('object' + bigIntToString(filteredBrands));
		return bigIntToString(filteredVendors);
	} catch (error) {
		console.log('error :: vendor.repo.js ' + error);
		throw error;
	}
};

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

const vendorRepoIsVendorExists = async (center_id, vendor_name) => {
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

module.exports = {
	vendorRepoAddVendor,
	vendorRepoUpdateVendor,
	vendorRepoSearchVendors,
	vendorRepoGetVendorDetails,
	vendorRepoIsVendorExists,
	vendorRepoDeleteVendor,
};
