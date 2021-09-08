import prisma from '../config/prisma';
const { currentTimeInTimeZone, bigIntToString } = require('../utils/utils');

export const getCenterDetails = async (center_id: any) => {
	const result = await prisma.center.findMany({
		where: {
			id: Number(center_id),
		},
		include: {
			state: true,
		},
	});
	return bigIntToString(result);
};

export const updateCenter = async (requestBody: any) => {
	let jsonObj = requestBody;

	var objValue = jsonObj['formArray'];

	const basic_info = objValue[0];
	const general_info = objValue[1];
	const addl_info = objValue[2];

	const center_id = basic_info['center_id'];
	const company_id = basic_info['company_id'];

	const name = basic_info['name'];

	const address1 = basic_info['address1'];
	const address2 = basic_info['address2'];
	const address3 = basic_info['address3'];
	const district = basic_info['district'];

	const state_id = basic_info['state_id'];
	const pin = basic_info['pin'];

	const gst = general_info['gst'];
	const phone = general_info['phone'];
	const mobile = general_info['mobile'];
	const mobile2 = general_info['mobile2'];
	const whatsapp = general_info['whatsapp'];

	const email = addl_info['email'];

	const bankname = addl_info['bankname'];
	const accountno = addl_info['accountno'];
	const ifsccode = addl_info['ifsccode'];
	const branch = addl_info['branch'];

	const result = await prisma.center.update({
		where: {
			id: Number(center_id),
		},
		data: {
			company_id: Number(company_id),
			name: name,
			address1: address1,
			address2: address2,
			address3: address3,
			district: district,
			state_id: Number(state_id),
			pin: pin,
			gst: gst,
			phone: phone,
			mobile: mobile,
			mobile2: mobile2,
			whatsapp: whatsapp,
			email: email,
			bankname: bankname,
			accountno: accountno,
			ifsccode: ifsccode,
			branch: branch,
		},
	});

	return bigIntToString(result);
};

module.exports = {
	getCenterDetails,
	updateCenter,
};
