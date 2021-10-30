const {
	vendorRepoAddVendor,
	vendorRepoUpdateVendor,
	vendorRepoSearchVendors,
	vendorRepoGetVendorDetails,
	vendorRepoIsVendorExists,
	vendorRepoDeleteVendor,
} = require('../repos/vendor.repo');

async function insertVendor(vendor) {
	return vendorRepoAddVendor(vendor);
}

async function updateVendor(vendor) {
	return vendorRepoUpdateVendor(vendor);
}

async function getSearchVendors(center_id, search_text) {
	return vendorRepoSearchVendors(center_id, search_text);
}

async function getVendorDetails(center_id, vendor_id) {
	return vendorRepoGetVendorDetails(center_id, vendor_id);
}

async function isVendorExists(center_id, name) {
	return vendorRepoIsVendorExists(center_id, name);
}

async function deleteVendor(id) {
	return vendorRepoDeleteVendor(id);
}

// export const deleteVendor = async (id) => {

// export const isVendorExists = async (center_id, name) => {

// const insertVendor = async (insertValues) => {
// 	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

// 	const result = await prisma.vendor.create({
// 		data: {
// 			center_id: Number(insertValues.center_id),
// 			name: insertValues.name,
// 			address1: insertValues.address1,
// 			address2: insertValues.address2,
// 			address3: insertValues.address3,
// 			district: insertValues.district,
// 			state_id: insertValues.state_id,
// 			pin: insertValues.pin,
// 			gst: insertValues.gst,
// 			phone: insertValues.phone,
// 			mobile: insertValues.mobile,
// 			mobile2: insertValues.mobile2,
// 			whatsapp: insertValues.whatsapp,
// 			email: insertValues.email,
// 		},
// 	});

// 	return result;
// };

// const updateVendor = async (updateValues, id) => {
// 	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');
// 	const result = await prisma.vendor.update({
// 		where: {
// 			id: Number(id),
// 		},
// 		data: {
// 			center_id: updateValues.center_id,
// 			name: updateValues.name,
// 			address1: updateValues.address1,
// 			address2: updateValues.address2,
// 			address3: updateValues.address3,
// 			district: updateValues.district,
// 			state_id: updateValues.state_id,
// 			pin: updateValues.pin,
// 			gst: updateValues.gst,
// 			phone: updateValues.phone,
// 			mobile: updateValues.mobile,
// 			mobile2: updateValues.mobile2,
// 			whatsapp: updateValues.whatsapp,
// 			email: updateValues.email,
// 		},
// 	});
// 	return result;
// };

// export const getSearchVendors = async (center_id, searchstr) => {
// 	const filteredVendors = await prisma.vendor.findMany({
// 		take: 50,
// 		where: {
// 			center_id: Number(center_id),
// 			is_active: 'A',
// 			name: {
// 				contains: searchstr,
// 			},
// 		},
// 		include: {
// 			state: true,
// 		},
// 	});
// 	// console.log('object' + bigIntToString(filteredBrands));
// 	return bigIntToString(filteredVendors);
// };

// const getVendorDetails = async (center_id, vendor_id) => {
// 	const vendorDetails = await prisma.vendor.findMany({
// 		where: {
// 			center_id: Number(center_id),
// 			id: Number(vendor_id),
// 		},
// 		include: {
// 			state: true,
// 		},
// 		orderBy: {
// 			name: 'asc',
// 		},
// 	});

// 	return bigIntToString(vendorDetails);
// };

// export const isVendorExists = async (center_id, name) => {
// 	let vendorCount = await prisma.vendor.count({
// 		where: {
// 			name: name,
// 			center_id: Number(center_id),
// 		},
// 	});

// 	return { result: vendorCount };
// };

// export const deleteVendor = async (id) => {
// 	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

// 	const result = await prisma.vendor.update({
// 		where: {
// 			id: Number(id),
// 		},
// 		data: {
// 			is_active: 'D',
// 		},
// 	});

// 	return bigIntToString(result);
// };

module.exports = {
	insertVendor,
	updateVendor,
	getSearchVendors,

	getVendorDetails,
	isVendorExists,
	deleteVendor,
};
