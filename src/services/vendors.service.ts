import prisma from '../config/prisma';
import VendorRepo from '../repos/vendor.repo';
import { IVendor } from '../domain/Vendor';

const { currentTimeInTimeZone, promisifyQuery, bigIntToString } = require('../utils/utils');

export async function insertVendor(vendor: IVendor) {
	return VendorRepo.addVendor(vendor);
}

export async function updateVendor(vendor: IVendor) {
	return VendorRepo.updateVendor(vendor);
}

export async function getSearchVendors(center_id: any, search_text: any) {
	return VendorRepo.searchVendors(center_id, search_text);
}

export async function getVendorDetails(center_id: any, vendor_id: any) {
	return VendorRepo.getVendorDetails(center_id, vendor_id);
}

export async function isVendorExists(center_id: any, name: any) {
	return VendorRepo.isVendorExists(center_id, name);
}

export async function deleteVendor(id: any) {
	return VendorRepo.deleteVendor(id);
}

// export const deleteVendor = async (id: any) => {

// export const isVendorExists = async (center_id: any, name: any) => {

// const insertVendor = async (insertValues: any) => {
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

// const updateVendor = async (updateValues: any, id: any) => {
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

// export const getSearchVendors = async (center_id: any, searchstr: any) => {
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

// const getVendorDetails = async (center_id: any, vendor_id: any) => {
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

// export const isVendorExists = async (center_id: any, name: any) => {
// 	let vendorCount = await prisma.vendor.count({
// 		where: {
// 			name: name,
// 			center_id: Number(center_id),
// 		},
// 	});

// 	return { result: vendorCount };
// };

// export const deleteVendor = async (id: any) => {
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
