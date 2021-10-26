var pool = require('../config/db');
const moment = require('moment-timezone');
const bcrypt = require('bcrypt');
const httpStatus = require('http-status');
const ApiError = require('./ApiError');

let center_timezone: string;

const number2text = (value: any) => {
	// function number2text(value) {
	var fraction = Math.round(frac(value) * 100);
	var f_text = '';

	if (fraction > 0) {
		f_text = 'and ' + convert_number(fraction) + ' paise';
	}

	return convert_number(value) + ' Rupees ' + f_text + ' only';
};

function frac(f: any) {
	return f % 1;
}

function convert_number(number: any) {
	if (number < 0 || number > 999999999) {
		return 'Number out of range!';
	}
	var Gn = Math.floor(number / 10000000); /* Crore */
	number -= Gn * 10000000;
	var kn = Math.floor(number / 100000); /* lakhs */
	number -= kn * 100000;
	var Hn = Math.floor(number / 1000); /* thousand */
	number -= Hn * 1000;
	var Dn = Math.floor(number / 100); /* Tens (deca) */
	number = number % 100; /* Ones */
	var tn = Math.floor(number / 10);
	var one = Math.floor(number % 10);
	var res = '';

	if (Gn > 0) {
		res += convert_number(Gn) + ' crore';
	}
	if (kn > 0) {
		res += (res == '' ? '' : ' ') + convert_number(kn) + ' lakh';
	}
	if (Hn > 0) {
		res += (res == '' ? '' : ' ') + convert_number(Hn) + ' thousand';
	}

	if (Dn) {
		res += (res == '' ? '' : ' ') + convert_number(Dn) + ' hundred';
	}

	var ones = Array(
		'',
		'One',
		'Two',
		'Three',
		'Four',
		'Five',
		'Six',
		'Seven',
		'Eight',
		'Nine',
		'Ten',
		'Eleven',
		'Twelve',
		'Thirteen',
		'Fourteen',
		'Fifteen',
		'Sixteen',
		'Seventeen',
		'Eighteen',
		'Nineteen',
	);
	var tens = Array('', '', 'Twenty', 'Thirty', 'Fourty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety');

	if (tn > 0 || one > 0) {
		if (!(res == '')) {
			res += ' and ';
		}
		if (tn < 2) {
			res += ones[tn * 10 + one];
		} else {
			res += tens[tn];
			if (one > 0) {
				res += '-' + ones[one];
			}
		}
	}

	if (res == '') {
		res = 'Zero';
	}
	return res;
}

function toTimeZone(time: any, zone: any) {
	var format = 'YYYY-MM-DDTHH:mm:ssZ';
	return moment(time, format).tz(zone).format('DD-MM-YYYY');
}

function toTimeZoneFormat(time: any, format: any) {
	var default_format = 'YYYY-MM-DDTHH:mm:ssZ';

	return moment(time, default_format).tz(getTimezone()).format(format);
}

function currentTimeInTimeZone(format: any) {
	return moment(moment(), format).tz(getTimezone()).format(format);
}

export function getCurrentYear() {
	return currentTimeInTimeZone('YY');
}

export function setTimezone(timezone: string) {
	center_timezone = timezone;
}

export function getTimezone() {
	return center_timezone;
}

export function getCurrentMonth() {
	return currentTimeInTimeZone('MM');
}

export function leftPad(value: string) {
	return value.padStart(6, '0');
}

export function formatSequenceNumber(sequence: any, type: string = '') {
	return `${type}${getCurrentYear()}/${getCurrentMonth()}/${leftPad(sequence)}`;
}

const encryptPassword = async (password: any) => {
	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		return hashedPassword;
	} catch (errors) {
		console.log('log errors ' + errors);
	}
};

const escapeText = (text: any) => {
	let tempTxt = text.replaceAll(/`/g, '\\`');
	tempTxt = tempTxt.replaceAll(/'/g, "\\'");

	return tempTxt;
};

const promisifyQuery = (query: any, values = '') => {
	return new Promise((resolve, reject) => {
		pool.query(query, values, (err: any, data: any) => {
			if (err) {
				return reject(err);
			}
			resolve(data);
		});
	});
};

const responseForward = (data: any, msg: any, res: any, status = 200) => {
	if (!data) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, msg);
	}

	return res.status(status).json(data);
};

const bigIntToString = (data: any) => {
	const result = JSON.stringify(data, (key, value) => (typeof value === 'bigint' ? value.toString() : value));
	return JSON.parse(result);
};

module.exports = {
	number2text,
	toTimeZone,
	currentTimeInTimeZone,
	toTimeZoneFormat,
	encryptPassword,
	escapeText,
	promisifyQuery,
	responseForward,
	bigIntToString,
	getCurrentYear,
	getCurrentMonth,
	formatSequenceNumber,
	setTimezone,
	getTimezone,
};
