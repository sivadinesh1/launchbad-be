const fs = require('fs');
const moment = require('moment-timezone');

// require dependencies
const PDFDocument = require('pdfkit');

const { number2text } = require('../utils/utils');

let line_x_start = 24;
let line_x_end = 571;

function createInvoice(saleMaster, saleDetails, customerDetails, centerDetails, path, res, print_type, print_ship_to) {
	let center_data = centerDetails[0];
	let customer_data = customerDetails[0];
	let sale_master_data = saleMaster[0];
	let sale_details_data = saleDetails;
	res.contentType('application/pdf');

	let doc = new PDFDocument({
		'page-size': 'A4',
		dpi: 400,
		margin: 24,
		autoFirstPage: false,
		layout: 'portrait', // can be 'landscape'
	});

	// first check if print_type is an array
	if (Array.isArray(print_type)) {
		// loop through the different print types and add pages and send response
		print_type.forEach((e) => {
			doc.addPage();
			doc.font('Helvetica');
			generateHeader(doc, center_data, e);
			generateCustomerInformation(doc, customer_data, sale_master_data, print_ship_to);

			if (print_ship_to) {
				generateShippingInformation(doc, customer_data, sale_master_data);
			}

			generateInvoiceTable(doc, sale_master_data, sale_details_data, center_data, e, customer_data, print_ship_to);
			generateFooterSummary(doc, center_data);

			//		doc[counter].pipe(fs.createWriteStream(path));
		});
	}

	//	var stream = doc.pipe(blobStream());
	// stream.on("finish", function() {

	// get a blob you can do whatever you like with
	// const blob = stream.toBlob("application/pdf");

	// doc.pipe(blob);

	// or get a blob URL for display in the browser
	// const url = stream.toBlobURL('application/pdf');
	//  // iframe.src = url;
	// res.send(url);
	// });

	// pipe the response
	doc.end();
	doc.pipe(res);
}

function generateHeader(doc, center_data, print_type) {
	// doc.image('tractor.png', 24, 24, { width: 70 }).fillColor('darkblue');

	doc.image('upload/' + center_data.logo_name, 24, 24, { width: 70 }).fillColor('darkblue');

	doc.font('Helvetica').fontSize(10).text(print_type, 400, 20, { align: 'right' }).font('Helvetica');

	doc.fillColor('#000000');
	doc.font('Helvetica-Bold')
		.fontSize(14)
		.text(center_data.name, 10, 40, {
			align: 'center',
			lineGap: 2,
			characterSpacing: 1.2,
		})
		.font('Helvetica')
		.fontSize(9)

		.text(center_data.tagline, {
			align: 'center',
			lineGap: 1.5,
			characterSpacing: 1,
		})
		.text(center_data.address1 + ',' + center_data.address2 + ', ' + center_data.district + '-' + center_data.pin, {
			align: 'center',
			lineGap: 1.5,
		})

		.text('GST : ' + center_data.gst, { align: 'center', lineGap: 1.5 })
		.text('Email: ' + center_data.email, { align: 'center', lineGap: 1.5 })

		.text('Phone : ' + center_data.phone + ' & ' + center_data.mobile, 410, 92);

	doc.image('upload/' + center_data.side_logo_name, 475, 62, { width: 80 });

	// if (center_data.id === 3) {
	// 	doc.image('sonalika.png', 475, 62, { width: 80 });
	// } else {
	// 	doc.image('swaraj.png', 475, 62, { width: 80 });
	// }

	doc.moveDown();
}

function generateCustomerInformation(doc, customer_data, sale_master_data, print_ship_to) {
	// first line before customer section
	generateHr(doc, line_x_start, line_x_end, 109);

	if (print_ship_to) {
		doc.fillColor('#000000').fontSize(13).text('Registered Office', 260, 117);
	} else {
		doc.fillColor('#000000').fontSize(13).font('Helvetica-Bold').text('To', 34, 117).font('Helvetica');
	}

	let invoice_type = sale_master_data.invoice_type === 'gstInvoice' ? 'Tax Invoice' : 'Stock Issue';

	doc.fillColor('#000000').fontSize(12).text(invoice_type, 440, 119, { align: 'center' });
	doc.fillColor('#000000');
	doc.strokeColor('#000000')
		.moveTo(460, 136)
		.lineTo(570, 136)

		.stroke();

	doc.fillColor('#000000')
		.fontSize(10)
		.text('BILL No.     : ' + sale_master_data.invoice_no, 460, 145);

	doc.fillColor('#000000')
		.fontSize(10)
		.text('BILL Date    : ' + moment(sale_master_data.invoice_date).format('DD/MM/YYYY'), 460, 160);

	const customerInformationTop = 136;

	if (customer_data.name === 'Walk In') {
		doc.fillColor('#000000')
			.fontSize(10)
			.font('Helvetica-Bold')
			.text(sale_master_data.retail_customer_name, 40, customerInformationTop)
			.font('Helvetica')
			.text(sale_master_data.retail_customer_address, 40, 151)
			.text(sale_master_data.retail_customer_phone, 40, 171);
	} else {
		if (print_ship_to) {
			doc.fillColor('#000000')
				.fontSize(10)
				.font('Helvetica-Bold')
				.text(customer_data.name, 270, customerInformationTop)
				.font('Helvetica')
				.text(customer_data.address1, 270, 151);
		} else {
			doc.fillColor('#000000')
				.fontSize(10)
				.font('Helvetica-Bold')
				.text(customer_data.name, 40, customerInformationTop)
				.font('Helvetica')
				.text(customer_data.address1, 40, 151);
		}
	}

	if (customer_data.district !== '') {
		if (print_ship_to) {
			doc.text(customer_data.address2 + ', District: ' + customer_data.district, 270, 166);
		} else {
			doc.text(customer_data.address2 + ', District: ' + customer_data.district, 40, 166);
		}
	} else {
		if (print_ship_to) {
			doc.text(customer_data.address2, 270, 166);
		} else {
			doc.text(customer_data.address2, 40, 166);
		}
	}
	if (print_ship_to) {
		doc.fillColor('#000000')
			.text('State: ' + customer_data.description + ' Pin: ' + customer_data.pin, 270, 181)
			.font('Helvetica-Bold')
			.text('Phone: ' + customer_data.mobile + ' GST: ' + customer_data.gst, 270, 196)
			.font('Helvetica')
			.moveDown();
	} else {
		doc.fillColor('#000000')
			.text('State: ' + customer_data.description + ' Pin: ' + customer_data.pin, 40, 181)
			.font('Helvetica-Bold')
			.text('Phone: ' + customer_data.mobile + ' GST: ' + customer_data.gst, 40, 196)
			.font('Helvetica')
			.moveDown();
	}

	// line end of customer section
	generateHr(doc, line_x_start, line_x_end, 210);
}

function generateShippingInformation(doc, customer_data, sale_master_data) {
	// first line before customer section
	generateHr(doc, line_x_start, line_x_end, 109);

	doc.fillColor('#000000').fontSize(12).text('Ship To', 24, 117);

	const customerInformationTop = 136;

	if (customer_data.name === 'Walk In') {
		doc.fillColor('#000000')
			.fontSize(10)
			.font('Helvetica-Bold')
			.text(sale_master_data.retail_customer_name, 40, customerInformationTop)
			.font('Helvetica')
			.text(sale_master_data.retail_customer_address, 40, 151)
			.text(sale_master_data.retail_customer_phone, 40, 171);
	} else {
		doc.fillColor('#000000')
			.fontSize(10)
			.font('Helvetica-Bold')
			.text(customer_data.name, 40, customerInformationTop)
			.font('Helvetica')
			.text(customer_data.csa_address1, 40, 151);
	}

	if (customer_data.csa_district !== '') {
		doc.text(customer_data.csa_address2 + ', District: ' + customer_data.csa_district, 40, 166);
	} else {
		doc.text(customer_data.csa_address2, 40, 166);
	}

	doc.fillColor('#000000')
		.text('State: ' + customer_data.csa_description + ' Pin: ' + customer_data.pin, 40, 181)
		.font('Helvetica-Bold')
		.text('Phone: ' + customer_data.mobile + ' GST: ' + customer_data.gst, 40, 196)
		.font('Helvetica')
		.moveDown();

	// line end of customer section
	generateHr(doc, line_x_start, line_x_end, 210);
}

function generateInvoiceTable(doc, sale_master_data, sale_details_data, center_data, print_type, customer_data, print_ship_to) {
	let i;
	let invoiceTableTop = 216;
	let x_start = 24;
	let is_igs_t = false;

	if (sale_master_data.igs_t !== 0 || sale_master_data.igs_t !== 0.0) {
		is_igs_t = true;
	}

	generateTableRow(
		doc,
		invoiceTableTop,
		'SNo',
		'PRODUCT NAME',
		'P.CODE',
		' HSN ',
		' QTY ',
		' UOM ',
		' MRP ',
		'DIS%',
		' AMOUNT ',
		'SGST',
		'CGST',
		'NET AMT',
		x_start,
		is_igs_t,
		'IGST',
	);

	generateHr(doc, line_x_start, line_x_end, invoiceTableTop + 13);

	let snow = 30;
	let product_code_w = 60;
	let product_desc_w = 125;
	let hsn_w = 42;
	let qty_w = 30;
	let uom_w = 30;
	let mrp_w = 44;
	let discount_percent_w = 25;
	let amount_w = 45;
	let sgs_tw = 26;
	let cgs_tw = 26;
	let igs_tw = 51;
	let net_w = 47;

	//running HEADER vertical lines SI
	doc.strokeColor('#000000')
		.moveTo(x_start + snow, 210)
		.lineWidth(1)
		.lineTo(x_start + snow, 230)

		.stroke();

	// product code
	doc.strokeColor('#000000')
		.moveTo(x_start + (snow + 1) + product_code_w, 210)
		.lineWidth(1)
		.lineTo(x_start + (snow + 1) + product_code_w, 229);

	// product desc
	doc.strokeColor('#000000')
		.moveTo(x_start + (snow + 1) + (product_code_w + 1) + product_desc_w, 210)
		.lineWidth(1)
		.lineTo(x_start + (snow + 1) + (product_code_w + 1) + product_desc_w, 229)

		.stroke();

	// hsn code
	doc.strokeColor('#000000')
		.moveTo(x_start + (snow + 1) + (product_code_w + 1) + (product_desc_w + 1) + hsn_w, 210)
		.lineWidth(1)
		.lineTo(x_start + (snow + 1) + (product_code_w + 1) + (product_desc_w + 1) + hsn_w, 229)

		.stroke();

	// // qty
	doc.strokeColor('#000000')
		.moveTo(x_start + (snow + 1) + (product_code_w + 1) + (product_desc_w + 1) + (hsn_w + 1) + qty_w, 210)
		.lineWidth(1)
		.lineTo(x_start + (snow + 1) + (product_code_w + 1) + (product_desc_w + 1) + (hsn_w + 1) + qty_w, 229)

		.stroke();

	// // UOM
	doc.strokeColor('#000000')
		.moveTo(x_start + (snow + 1) + (product_code_w + 1) + (product_desc_w + 1) + (hsn_w + 1) + (qty_w + 1) + uom_w, 210)
		.lineWidth(1)
		.lineTo(x_start + (snow + 1) + (product_code_w + 1) + (product_desc_w + 1) + (hsn_w + 1) + (qty_w + 1) + uom_w, 229)

		.stroke();

	// // MRP
	doc.strokeColor('#000000')
		.moveTo(x_start + (snow + 1) + (product_code_w + 1) + (product_desc_w + 1) + (hsn_w + 1) + (qty_w + 1) + (uom_w + 1) + mrp_w, 210)
		.lineWidth(1)
		.lineTo(x_start + (snow + 1) + (product_code_w + 1) + (product_desc_w + 1) + (hsn_w + 1) + (qty_w + 1) + (uom_w + 1) + mrp_w, 229)

		.stroke();

	// // Disc %
	doc.strokeColor('#000000')
		.moveTo(
			x_start +
				(snow + 1) +
				(product_code_w + 1) +
				(product_desc_w + 1) +
				(hsn_w + 1) +
				(qty_w + 1) +
				(uom_w + 1) +
				(mrp_w + 1) +
				discount_percent_w,
			210,
		)
		.lineWidth(1)
		.lineTo(
			x_start +
				(snow + 1) +
				(product_code_w + 1) +
				(product_desc_w + 1) +
				(hsn_w + 1) +
				(qty_w + 1) +
				(uom_w + 1) +
				(mrp_w + 1) +
				discount_percent_w,
			229,
		)

		.stroke();

	// // Taxable Amount
	doc.strokeColor('#000000')
		.moveTo(
			x_start +
				(snow + 1) +
				(product_code_w + 1) +
				(product_desc_w + 1) +
				(hsn_w + 1) +
				(qty_w + 1) +
				(uom_w + 1) +
				(mrp_w + 1) +
				(discount_percent_w + 1) +
				amount_w,
			210,
		)
		.lineWidth(1)
		.lineTo(
			x_start +
				(snow + 1) +
				(product_code_w + 1) +
				(product_desc_w + 1) +
				(hsn_w + 1) +
				(qty_w + 1) +
				(uom_w + 1) +
				(mrp_w + 1) +
				(discount_percent_w + 1) +
				amount_w,
			229,
		)

		.stroke();

	if (!is_igs_t) {
		// sgs_t
		doc.strokeColor('#000000')
			.moveTo(
				x_start +
					(snow + 1) +
					(product_code_w + 1) +
					(product_desc_w + 1) +
					(hsn_w + 1) +
					(qty_w + 1) +
					(uom_w + 1) +
					(mrp_w + 1) +
					(discount_percent_w + 1) +
					(amount_w + 1) +
					sgs_tw,
				210,
			)
			.lineWidth(1)
			.lineTo(
				x_start +
					(snow + 1) +
					(product_code_w + 1) +
					(product_desc_w + 1) +
					(hsn_w + 1) +
					(qty_w + 1) +
					(uom_w + 1) +
					(mrp_w + 1) +
					(discount_percent_w + 1) +
					(amount_w + 1) +
					sgs_tw,
				229,
			)

			.stroke();

		// cgs_t
		doc.strokeColor('#000000')
			.moveTo(
				x_start +
					(snow + 1) +
					(product_code_w + 1) +
					(product_desc_w + 1) +
					(hsn_w + 1) +
					(qty_w + 1) +
					(uom_w + 1) +
					(mrp_w + 1) +
					(discount_percent_w + 1) +
					(amount_w + 1) +
					(sgs_tw + 1) +
					cgs_tw,
				210,
			)
			.lineWidth(1)
			.lineTo(
				x_start +
					(snow + 1) +
					(product_code_w + 1) +
					(product_desc_w + 1) +
					(hsn_w + 1) +
					(qty_w + 1) +
					(uom_w + 1) +
					(mrp_w + 1) +
					(discount_percent_w + 1) +
					(amount_w + 1) +
					(sgs_tw + 1) +
					cgs_tw,
				229,
			)

			.stroke();
	} else {
		//igs_t
		doc.strokeColor('#000000')
			.moveTo(
				x_start +
					(snow + 1) +
					(product_code_w + 1) +
					(product_desc_w + 1) +
					(hsn_w + 1) +
					(qty_w + 1) +
					(uom_w + 1) +
					(mrp_w + 1) +
					(discount_percent_w + 1) +
					(amount_w + 1) +
					igs_tw,
				210,
			)
			.lineWidth(1)
			.lineTo(
				x_start +
					(snow + 1) +
					(product_code_w + 1) +
					(product_desc_w + 1) +
					(hsn_w + 1) +
					(qty_w + 1) +
					(uom_w + 1) +
					(mrp_w + 1) +
					(discount_percent_w + 1) +
					(amount_w + 1) +
					igs_tw,
				229,
			)

			.stroke();
	}

	sale_details_data.forEach(function (k, idx) {
		if (idx === 0) {
			invoiceTableTop = invoiceTableTop + 16;
		} else {
			invoiceTableTop = invoiceTableTop + 11;
		}

		generateTableRow(
			doc,
			invoiceTableTop,
			idx + 1,
			k.product.product_description,
			k.product.product_code,
			k.product.hsn_code,
			k.quantity,
			k.unit_price,
			k.mrp,
			k.disc_percent,
			k.after_tax_value,
			k.sgs_t,
			k.cgs_t,
			k.total_value,
			x_start,
			is_igs_t,
			k.igs_t,
		);

		// new page
		if (invoiceTableTop > 520) {
			doc.fontSize(14);
			doc.text('continue in next page', 50, invoiceTableTop + 50);
			doc.fontSize(8);
			invoiceTableTop = 216;
			doc.addPage({
				margin: 24,
			});
			// for each new page this adds the center and customer data
			generateHeader(doc, center_data, print_type);
			generateHr(doc, line_x_start, line_x_end, 107);
			generateCustomerInformation(doc, customer_data, sale_master_data, print_ship_to);

			if (print_ship_to) {
				generateShippingInformation(doc, customer_data, sale_master_data);
			}
			generateTableRow(
				doc,
				invoiceTableTop,
				'SNo',
				'PRODUCT NAME',
				'P.CODE',
				' HSN ',
				' QTY ',
				' UOM ',
				' MRP ',
				'DIS%',
				' AMOUNT ',
				'sgs_t',
				'cgs_t',
				'NET AMT',
				x_start,
				is_igs_t,
				'igs_t',
			);

			generateHr(doc, line_x_start, line_x_end, invoiceTableTop + 10);
		}

		// RUNNING VERTICAL lines SALE DETAILS
		// Si.No
		doc.strokeColor('#000000')
			.moveTo(x_start + snow, invoiceTableTop - 6)
			.lineWidth(1)
			.lineTo(x_start + snow, 540) // this is the end point the line

			.stroke();

		// Product Code
		doc.strokeColor('#000000')
			.moveTo(x_start + (snow + 1) + product_code_w, invoiceTableTop - 8)
			.lineWidth(1)
			.lineTo(x_start + (snow + 1) + product_code_w, 540);

		// // Product Desc
		doc.strokeColor('#000000')
			.moveTo(x_start + (snow + 1) + (product_code_w + 1) + product_desc_w, invoiceTableTop - 8)
			.lineWidth(1)
			.lineTo(x_start + (snow + 1) + (product_code_w + 1) + product_desc_w, 540)

			.stroke();
		// hsn code
		doc.strokeColor('#000000')
			.moveTo(x_start + (snow + 1) + (product_code_w + 1) + (product_desc_w + 1) + hsn_w, invoiceTableTop - 8)
			.lineWidth(1)
			.lineTo(x_start + (snow + 1) + (product_code_w + 1) + (product_desc_w + 1) + hsn_w, 540)

			.stroke();

		// qty
		doc.strokeColor('#000000')
			.moveTo(x_start + (snow + 1) + (product_code_w + 1) + (product_desc_w + 1) + (hsn_w + 1) + qty_w, invoiceTableTop - 8)
			.lineWidth(1)
			.lineTo(x_start + (snow + 1) + (product_code_w + 1) + (product_desc_w + 1) + (hsn_w + 1) + qty_w, 540)

			.stroke();

		// UOM
		doc.strokeColor('#000000')
			.moveTo(x_start + (snow + 1) + (product_code_w + 1) + (product_desc_w + 1) + (hsn_w + 1) + (qty_w + 1) + uom_w, invoiceTableTop - 8)
			.lineWidth(1)
			.lineTo(x_start + (snow + 1) + (product_code_w + 1) + (product_desc_w + 1) + (hsn_w + 1) + (qty_w + 1) + uom_w, 540)

			.stroke();

		//MRP
		doc.strokeColor('#000000')
			.moveTo(
				x_start + (snow + 1) + (product_code_w + 1) + (product_desc_w + 1) + (hsn_w + 1) + (qty_w + 1) + (uom_w + 1) + mrp_w,
				invoiceTableTop - 8,
			)
			.lineWidth(1)
			.lineTo(x_start + (snow + 1) + (product_code_w + 1) + (product_desc_w + 1) + (hsn_w + 1) + (qty_w + 1) + (uom_w + 1) + mrp_w, 540)

			.stroke();

		// disc
		doc.strokeColor('#000000')
			.moveTo(
				x_start +
					(snow + 1) +
					(product_code_w + 1) +
					(product_desc_w + 1) +
					(hsn_w + 1) +
					(qty_w + 1) +
					(uom_w + 1) +
					(mrp_w + 1) +
					discount_percent_w,
				invoiceTableTop - 8,
			)
			.lineWidth(1)
			.lineTo(
				x_start +
					(snow + 1) +
					(product_code_w + 1) +
					(product_desc_w + 1) +
					(hsn_w + 1) +
					(qty_w + 1) +
					(uom_w + 1) +
					(mrp_w + 1) +
					discount_percent_w,
				540,
			)

			.stroke();

		// taxable amount
		doc.strokeColor('#000000')
			.moveTo(
				x_start +
					(snow + 1) +
					(product_code_w + 1) +
					(product_desc_w + 1) +
					(hsn_w + 1) +
					(qty_w + 1) +
					(uom_w + 1) +
					(mrp_w + 1) +
					(discount_percent_w + 1) +
					amount_w,
				invoiceTableTop - 8,
			)
			.lineWidth(1)
			.lineTo(
				x_start +
					(snow + 1) +
					(product_code_w + 1) +
					(product_desc_w + 1) +
					(hsn_w + 1) +
					(qty_w + 1) +
					(uom_w + 1) +
					(mrp_w + 1) +
					(discount_percent_w + 1) +
					amount_w,
				540,
			)

			.stroke();
		if (!is_igs_t) {
			//sgs_t
			doc.strokeColor('#000000')
				.moveTo(
					x_start +
						(snow + 1) +
						(product_code_w + 1) +
						(product_desc_w + 1) +
						(hsn_w + 1) +
						(qty_w + 1) +
						(uom_w + 1) +
						(mrp_w + 1) +
						(discount_percent_w + 1) +
						(amount_w + 1) +
						sgs_tw,
					invoiceTableTop - 8,
				)
				.lineWidth(1)
				.lineTo(
					x_start +
						(snow + 1) +
						(product_code_w + 1) +
						(product_desc_w + 1) +
						(hsn_w + 1) +
						(qty_w + 1) +
						(uom_w + 1) +
						(mrp_w + 1) +
						(discount_percent_w + 1) +
						(amount_w + 1) +
						sgs_tw,
					540,
				)

				.stroke();
			//cgs_t
			doc.strokeColor('#000000')
				.moveTo(
					x_start +
						(snow + 1) +
						(product_code_w + 1) +
						(product_desc_w + 1) +
						(hsn_w + 1) +
						(qty_w + 1) +
						(uom_w + 1) +
						(mrp_w + 1) +
						(discount_percent_w + 1) +
						(amount_w + 1) +
						(sgs_tw + 1) +
						cgs_tw,
					invoiceTableTop - 8,
				)
				.lineWidth(1)
				.lineTo(
					x_start +
						(snow + 1) +
						(product_code_w + 1) +
						(product_desc_w + 1) +
						(hsn_w + 1) +
						(qty_w + 1) +
						(uom_w + 1) +
						(mrp_w + 1) +
						(discount_percent_w + 1) +
						(amount_w + 1) +
						(sgs_tw + 1) +
						cgs_tw,
					540,
				)

				.stroke();
		} else {
			//igs_t
			doc.strokeColor('#000000')
				.moveTo(
					x_start +
						(snow + 1) +
						(product_code_w + 1) +
						(product_desc_w + 1) +
						(hsn_w + 1) +
						(qty_w + 1) +
						(uom_w + 1) +
						(mrp_w + 1) +
						(discount_percent_w + 1) +
						(amount_w + 1) +
						igs_tw,
					invoiceTableTop - 8,
				)
				.lineWidth(1)
				.lineTo(
					x_start +
						(snow + 1) +
						(product_code_w + 1) +
						(product_desc_w + 1) +
						(hsn_w + 1) +
						(qty_w + 1) +
						(uom_w + 1) +
						(mrp_w + 1) +
						(discount_percent_w + 1) +
						(amount_w + 1) +
						igs_tw,
					540,
				)

				.stroke();
		}
	});

	generateSummaryLeft(doc, sale_details_data, is_igs_t, sale_master_data);
}

function generateSummaryLeft(doc, sale_details_data, is_igs_t, sale_master_data) {
	let sum_sgs_t_0 = getSumByTaxTypeAndTaxPercent(sale_details_data, 'sgs_t', 0).toFixed(2);
	let sum_cgs_t_0 = getSumByTaxTypeAndTaxPercent(sale_details_data, 'cgs_t', 0).toFixed(2);
	let sum_igs_t_0 = getSumByTaxTypeAndTaxPercent(sale_details_data, 'igs_t', 0).toFixed(2);

	let sum_sgs_t_5 = getSumByTaxTypeAndTaxPercent(sale_details_data, 'sgs_t', 5).toFixed(2);
	let sum_cgs_t_5 = getSumByTaxTypeAndTaxPercent(sale_details_data, 'cgs_t', 5).toFixed(2);
	let sum_igs_t_5 = getSumByTaxTypeAndTaxPercent(sale_details_data, 'igs_t', 5).toFixed(2);

	let sum_sgs_t_12 = getSumByTaxTypeAndTaxPercent(sale_details_data, 'sgs_t', 12).toFixed(2);
	let sum_cgs_t_12 = getSumByTaxTypeAndTaxPercent(sale_details_data, 'cgs_t', 12).toFixed(2);
	let sum_igs_t_12 = getSumByTaxTypeAndTaxPercent(sale_details_data, 'igs_t', 12).toFixed(2);

	let sum_sgs_t_18 = getSumByTaxTypeAndTaxPercent(sale_details_data, 'sgs_t', 18).toFixed(2);
	let sum_cgs_t_18 = getSumByTaxTypeAndTaxPercent(sale_details_data, 'cgs_t', 18).toFixed(2);
	let sum_igs_t_18 = getSumByTaxTypeAndTaxPercent(sale_details_data, 'igs_t', 18).toFixed(2);

	let sum_sgs_t_28 = getSumByTaxTypeAndTaxPercent(sale_details_data, 'sgs_t', 28).toFixed(2);
	let sum_cgs_t_28 = getSumByTaxTypeAndTaxPercent(sale_details_data, 'cgs_t', 28).toFixed(2);
	let sum_igs_t_28 = getSumByTaxTypeAndTaxPercent(sale_details_data, 'igs_t', 28).toFixed(2);

	let GST_0 = +sum_sgs_t_0 / 2 + +sum_cgs_t_0 / 2 + +sum_igs_t_0;
	let GST_5 = +sum_sgs_t_5 / 2 + +sum_cgs_t_5 / 2 + +sum_igs_t_5;
	let GST_12 = +sum_sgs_t_12 / 2 + +sum_cgs_t_12 / 2 + +sum_igs_t_12;
	let GST_18 = +sum_sgs_t_18 / 2 + +sum_cgs_t_18 / 2 + +sum_igs_t_18;
	let GST_28 = +sum_sgs_t_28 / 2 + +sum_cgs_t_28 / 2 + +sum_igs_t_28;

	let sumDiscountPercent_0 = getSumByDiscountPercent(sale_details_data, 0).toFixed(2);
	let sumDiscountPercent_5 = getSumByDiscountPercent(sale_details_data, 5).toFixed(2);
	let sumDiscountPercent_12 = getSumByDiscountPercent(sale_details_data, 12).toFixed(2);
	let sumDiscountPercent_18 = getSumByDiscountPercent(sale_details_data, 18).toFixed(2);
	let sumDiscountPercent_28 = getSumByDiscountPercent(sale_details_data, 28).toFixed(2);

	let sumTaxablePercent_0 = getSumByTaxableByPercent(sale_details_data, 0).toFixed(2);
	let sumTaxablePercent_5 = getSumByTaxableByPercent(sale_details_data, 5).toFixed(2);
	let sumTaxablePercent_12 = getSumByTaxableByPercent(sale_details_data, 12).toFixed(2);
	let sumTaxablePercent_18 = getSumByTaxableByPercent(sale_details_data, 18).toFixed(2);
	let sumTaxablePercent_28 = getSumByTaxableByPercent(sale_details_data, 28).toFixed(2);

	let sumTotalPercent_0 = getSumByTotalByPercent(sale_details_data, 0).toFixed(2);
	let sumTotalPercent_5 = getSumByTotalByPercent(sale_details_data, 5).toFixed(2);
	let sumTotalPercent_12 = getSumByTotalByPercent(sale_details_data, 12).toFixed(2);
	let sumTotalPercent_18 = getSumByTotalByPercent(sale_details_data, 18).toFixed(2);
	let sumTotalPercent_28 = getSumByTotalByPercent(sale_details_data, 28).toFixed(2);

	let total_0 = +GST_0 + +sumDiscountPercent_0 + +sumTaxablePercent_0 + +sumTotalPercent_0;
	let total_5 = +GST_5 + +sumDiscountPercent_5 + +sumTaxablePercent_5 + +sumTotalPercent_5;
	let total_12 = +GST_12 + +sumDiscountPercent_12 + +sumTaxablePercent_12 + +sumTotalPercent_12;
	let total_18 = +GST_18 + +sumDiscountPercent_18 + +sumTaxablePercent_18 + +sumTotalPercent_18;
	let total_28 = +GST_28 + +sumDiscountPercent_28 + +sumTaxablePercent_28 + +sumTotalPercent_28;

	let subtotalAllTax = +sumTaxablePercent_0 + +sumTaxablePercent_5 + +sumTaxablePercent_12 + +sumTaxablePercent_18 + +sumTaxablePercent_28;
	let discountAllTax = +sumDiscountPercent_0 + +sumDiscountPercent_5 + +sumDiscountPercent_12 + +sumDiscountPercent_18 + +sumDiscountPercent_28;
	let totalAllTax = +sumTotalPercent_0 + +sumTotalPercent_5 + +sumTotalPercent_12 + +sumTotalPercent_18 + +sumTotalPercent_28;

	let sgs_tAllTax = +sum_sgs_t_0 / 2 + +sum_sgs_t_5 / 2 + +sum_sgs_t_12 / 2 + +sum_sgs_t_18 / 2 + +sum_sgs_t_28 / 2;
	let cgs_tAllTax = +sum_cgs_t_0 / 2 + +sum_cgs_t_5 / 2 + +sum_cgs_t_12 / 2 + +sum_cgs_t_18 / 2 + +sum_cgs_t_28 / 2;
	let igs_tAllTax = +sum_igs_t_0 + +sum_igs_t_5 + +sum_igs_t_12 + +sum_igs_t_18 + +sum_igs_t_28;

	let finalTotalAllTax = +sumTotalPercent_0 + +sumTotalPercent_5 + +sumTotalPercent_12 + +sumTotalPercent_18 + +sumTotalPercent_28;

	// adjusting footer section 1 height
	let start = 539;
	generateHr(doc, line_x_start, line_x_end, start);
	doc.font('Helvetica-Bold');
	generateSummaryLeftTableRow(doc, start + 10, 'CLASS', 'SUB TOTAL', 'DISC', 'AMOUNT', 'SGST', 'CGST', 'GST', 'TOTAL', is_igs_t, 'IGST');
	doc.font('Helvetica');
	generateSummaryLeftTableRow(
		doc,
		start + 25,
		'GST 5%',
		sumTotalPercent_5,
		sumDiscountPercent_5,
		sumTaxablePercent_5,
		sum_sgs_t_5,
		sum_cgs_t_5,
		GST_5,
		sumTotalPercent_5,
		is_igs_t,
		sum_igs_t_5,
	);
	generateSummaryLeftTableRow(
		doc,
		start + 40,
		'GST 12%',
		sumTotalPercent_12,
		sumDiscountPercent_12,
		sumTaxablePercent_12,
		sum_sgs_t_12,
		sum_cgs_t_12,
		GST_12,
		sumTotalPercent_12,
		is_igs_t,
		sum_igs_t_12,
	);
	generateSummaryLeftTableRow(
		doc,
		start + 55,
		'GST 18%',
		sumTotalPercent_18,
		sumDiscountPercent_18,
		sumTaxablePercent_18,
		sum_sgs_t_18,
		sum_cgs_t_18,
		GST_18,
		sumTotalPercent_18,
		is_igs_t,
		sum_cgs_t_18,
	);
	generateSummaryLeftTableRow(
		doc,
		start + 70,
		'GST 28%',
		sumTotalPercent_28,
		sumDiscountPercent_28,
		sumTaxablePercent_28,
		sum_sgs_t_28,
		sum_cgs_t_28,
		GST_28,
		sumTotalPercent_28,
		is_igs_t,
		sum_cgs_t_28,
	);
	generateSummaryLeftTableRow(
		doc,
		start + 85,
		'GST 0%',
		sumTotalPercent_0,
		sumDiscountPercent_0,
		sumTaxablePercent_0,
		sum_sgs_t_0,
		sum_cgs_t_0,
		GST_0,
		sumTotalPercent_0,
		is_igs_t,
		sum_cgs_t_0,
	);

	generateHr(doc, line_x_start, line_x_end, start + 97);

	doc.font('Helvetica-Bold');
	generateSummaryLeftTableRow(
		doc,
		start + 105,
		'TOTAL',
		totalAllTax,
		discountAllTax,
		subtotalAllTax,

		sgs_tAllTax * 2,
		cgs_tAllTax * 2,
		sgs_tAllTax + cgs_tAllTax + igs_tAllTax,
		finalTotalAllTax,
		is_igs_t,
		igs_tAllTax,
	);
	doc.font('Helvetica');

	generateSummaryRightTableRow(
		doc,
		start + 10,
		totalAllTax,
		discountAllTax,
		sgs_tAllTax * 2,
		cgs_tAllTax * 2,
		finalTotalAllTax,
		is_igs_t,
		igs_tAllTax,
		sale_master_data,
	);
	generateHr(doc, line_x_start, line_x_end, start + 120);
	numberToText(doc, finalTotalAllTax, start);
	generateHr(doc, line_x_start, line_x_end, start + 137);
}

function numberToText(doc, finalTotalAllTax, start) {
	doc.font('Helvetica-Bold');
	doc.fontSize(9).text(number2text(roundOffFn(finalTotalAllTax, 'rounding')), 24, start + 125, {
		align: 'left',
	});
	doc.font('Helvetica');
}

function generateFooter(doc) {
	doc.fontSize(10).text('Payment is due within 15 days. Thank you for your business.', 50, 780, {
		align: 'center',
		width: 500,
	});
}

function generateToBlock(doc, customer_data) {
	doc.fontSize(11).text('To', 50, 350);
}

function generateFooterSummary(doc, center_data) {
	// adjusting footer section 2
	let start = 680;

	doc.fontSize(8)
		.text('Terms & Conditions:', 24, start)
		.text('Goods once sold will not be taken back or exchanged.', {
			lineGap: 1.8,
		})
		.text('Bills not paid due date will attract 24% interest.', {
			lineGap: 1.8,
		})
		.text('All disputes subject to Jurisdiction only.', { lineGap: 1.8 })
		.text('Prescribed Sales Tax declaration will be given.', { lineGap: 1.8 });

	doc.strokeColor('#000000')
		.lineWidth(1)
		.moveTo(24, start + 54)
		.lineTo(280, start + 54)
		.stroke();

	doc.fontSize(8)
		.text('Certified that the particulars given above are true and correct', 24, start + 60, { lineGap: 1.8 })
		.text('and the amount indicated represents the price actually charged.', 24, start + 70, { lineGap: 1.8 });

	doc.fontSize(8)
		.font('Helvetica-Bold')
		.text('OUR BANK        : ' + center_data.bank_name, 320, start, {
			lineGap: 1.8,
		})
		.text('A/C NAME          : ' + center_data.account_name, 320, start + 10, {
			lineGap: 1.8,
		})
		.text('A/C NO               : ' + center_data.account_no, 320, start + 20, {
			lineGap: 1.8,
		});
	doc.font('Times-BoldItalic');
	doc.fontSize(6).text(`Plz pay Cash/Cheque/DD in favour of '${center_data.account_name}'.`, 320, start + 30, { lineGap: 1.4 });

	doc.fontSize(7).text('For    ' + center_data.account_name, 400, start + 40);
	doc.fontSize(7).text('Authorized signatory', 400, start + 75);

	//  doc.fontSize(8).text("Checked By    " + center_data.name, 350, 680);
	//  doc.fontSize(8).text("  E.&O.E.", 350, 700);

	// doc.fontSize(8).text("Prepared by:", 50, 800).text("Packed by:", 150, 800).text("Checked by:", 250, 800).text("Authorized signatory:", 350, 800);
	doc.fontSize(8).text('Software By: 97316 16386', 250, 758);
}

function generateTableRow(
	doc,
	y,
	idx,
	product_description,
	product_code,
	hsn,
	qty,
	uom,
	mrp,
	disc_percent,
	amount,
	sgs_t,
	cgs_t,
	net_amount,
	x_start,
	is_igs_t,
	igs_t,
) {
	doc.fillColor('#000000');

	let snow = 29;
	let product_code_w = 59;
	let product_desc_w = 124;
	let hsn_w = 41;
	let qty_w = 29;
	let uom_w = 29;
	let mrp_w = 44;
	let discount_percent_w = 24;
	let amount_w = 44;
	let sgs_tw = 25;
	let cgs_tw = 25;
	let igs_tw = 50;
	let net_w = 48;

	// Si.No Id
	if (idx === 'SNo') {
		doc.fontSize(8).text(idx, x_start, y, { width: snow - 5, align: 'left' });
	} else {
		doc.fontSize(8).text(idx, x_start, y, { width: snow - 5, align: 'left' });
	}

	// P.CODE
	if (product_code === 'P.CODE') {
		doc.text(product_code, x_start + (snow + 2), y, {
			width: product_code_w,
			align: 'left',
		});
	} else {
		doc.text(product_code, x_start + (snow + 3), y, {
			width: product_code_w,
			align: 'left',
		});
	}

	if (product_description !== 'PRODUCT NAME') {
		doc.text(
			product_description.length > 33 ? product_description.substr(0, 29) + '...' : product_description,
			x_start + (snow + 2) + (product_code_w + 3),
			y,
			{
				width: product_desc_w,
				align: 'left',
				ellipsis: true,
			},
		);
	} else {
		doc.text(product_description, x_start + (snow + 2) + (product_code_w + 2), y, {
			width: product_desc_w,
			align: 'left',
		});
	}

	// HSNCode
	if (hsn === ' HSN ') {
		doc.text(hsn, x_start + (snow + 2) + (product_code_w + 2) + (product_desc_w + 2), y, {
			width: hsn_w,
			align: 'center',
		});
	} else {
		doc.text(hsn, x_start + (snow + 2) + (product_code_w + 2) + (product_desc_w + 3), y, {
			width: hsn_w,
			align: 'left',
		});
	}

	if (qty === ' QTY ') {
		doc.text(qty, x_start + (snow + 2) + (product_code_w + 2) + (product_desc_w + 2) + (hsn_w + 2), y, { width: qty_w - 1, align: 'right' });
	} else {
		doc.text(qty, x_start + (snow + 2) + (product_code_w + 2) + (product_desc_w + 2) + (hsn_w + 2), y, { width: qty_w - 3, align: 'right' }); // ADJUST FROM RIGHT
	}

	if (uom === ' UOM ') {
		doc.text(uom, x_start + (snow + 2) + (product_code_w + 2) + (product_desc_w + 2) + (hsn_w + 2) + (qty_w + 2), y, {
			width: uom_w,
			align: 'center',
		});
	} else {
		doc.text(uom, x_start + (snow + 2) + (product_code_w + 2) + (product_desc_w + 2) + (hsn_w + 2) + (qty_w + 2), y, {
			width: uom_w,
			align: 'center',
		});
	}

	if (mrp === ' MRP ') {
		doc.text(mrp, x_start + (snow + 2) + (product_code_w + 2) + (product_desc_w + 2) + (hsn_w + 2) + (qty_w + 2) + (uom_w + 2), y, {
			width: mrp_w - 1,
			align: 'center',
		});
	} else {
		doc.text((+mrp).toFixed(2), x_start + (snow + 2) + (product_code_w + 2) + (product_desc_w + 2) + (hsn_w + 2) + (qty_w + 2) + (uom_w + 2), y, {
			width: mrp_w - 3,
			align: 'right',
		});
	}

	if (disc_percent === 'DIS%') {
		doc.text(
			disc_percent,
			x_start + (snow + 2) + (product_code_w + 2) + (product_desc_w + 2) + (hsn_w + 2) + (qty_w + 2) + (uom_w + 2) + (mrp_w + 2),
			y,
			{
				width: discount_percent_w,
				align: 'center',
			},
		);
	} else {
		doc.text(
			Number(disc_percent).toFixed(2),
			x_start + (snow + 2) + (product_code_w + 2) + (product_desc_w + 2) + (hsn_w + 2) + (qty_w + 2) + (uom_w + 2) + (mrp_w + 2),
			y,
			{
				width: discount_percent_w - 2,
				align: 'right',
			},
		);
	}

	if (amount === ' AMOUNT ') {
		doc.text(
			amount,
			x_start +
				(snow + 2) +
				(product_code_w + 2) +
				(product_desc_w + 2) +
				(hsn_w + 2) +
				(qty_w + 2) +
				(uom_w + 2) +
				(mrp_w + 2) +
				(discount_percent_w + 2),
			y,
			{
				width: amount_w - 3,
				align: 'right',
			},
		);
	} else {
		doc.text(
			Number(amount).toFixed(2),
			x_start +
				(snow + 2) +
				(product_code_w + 2) +
				(product_desc_w + 2) +
				(hsn_w + 2) +
				(qty_w + 2) +
				(uom_w + 2) +
				(mrp_w + 2) +
				(discount_percent_w + 2),
			y,
			{
				width: amount_w - 3,
				align: 'right',
			},
		);
	}

	if (sgs_t === 'SGST' && !is_igs_t) {
		doc.text(
			sgs_t,
			x_start +
				(snow + 2) +
				(product_code_w + 2) +
				(product_desc_w + 2) +
				(hsn_w + 2) +
				(qty_w + 2) +
				(uom_w + 2) +
				(mrp_w + 2) +
				(discount_percent_w + 2) +
				(amount_w + 2),
			y,
			{ width: sgs_tw, align: 'center' },
		);
	} else if (!is_igs_t) {
		doc.text(
			Number(sgs_t).toFixed(2),
			x_start +
				(snow + 2) +
				(product_code_w + 2) +
				(product_desc_w + 2) +
				(hsn_w + 2) +
				(qty_w + 2) +
				(uom_w + 2) +
				(mrp_w + 2) +
				(discount_percent_w + 2) +
				(amount_w + 2),
			y,
			{ width: sgs_tw - 3, align: 'right' },
		);
	}

	if (cgs_t === 'CGST' && !is_igs_t) {
		doc.text(
			cgs_t,
			x_start +
				(snow + 2) +
				(product_code_w + 2) +
				(product_desc_w + 2) +
				(hsn_w + 2) +
				(qty_w + 2) +
				(uom_w + 2) +
				(mrp_w + 2) +
				(discount_percent_w + 2) +
				(amount_w + 2) +
				(sgs_tw + 2),
			y,
			{ width: cgs_tw - 1, align: 'right' },
		);
	} else if (!is_igs_t) {
		doc.text(
			Number(cgs_t).toFixed(2),
			x_start +
				(snow + 2) +
				(product_code_w + 2) +
				(product_desc_w + 2) +
				(hsn_w + 2) +
				(qty_w + 2) +
				(uom_w + 2) +
				(mrp_w + 2) +
				(discount_percent_w + 2) +
				(amount_w + 2) +
				(sgs_tw + 2),
			y,
			{ width: cgs_tw - 3, align: 'right' },
		);
	}

	if (igs_t === 'IGST' && is_igs_t) {
		doc.text(
			igs_t,

			x_start +
				(snow + 2) +
				(product_code_w + 2) +
				(product_desc_w + 2) +
				(hsn_w + 2) +
				(qty_w + 2) +
				(uom_w + 2) +
				(mrp_w + 2) +
				(discount_percent_w + 2) +
				(amount_w + 2),
			y,
			{ width: igs_tw, align: 'center' },
		);
	} else if (is_igs_t) {
		doc.text(
			Number(igs_t).toFixed(2),

			x_start +
				(snow + 2) +
				(product_code_w + 2) +
				(product_desc_w + 2) +
				(hsn_w + 2) +
				(qty_w + 2) +
				(uom_w + 2) +
				(mrp_w + 2) +
				(discount_percent_w + 2) +
				(amount_w + 2),
			y,
			{ width: igs_tw - 20, align: 'right' },
		);
	}

	if (net_amount === 'NET AMT') {
		doc.text(
			net_amount,
			x_start +
				(snow + 2) +
				(product_code_w + 2) +
				(product_desc_w + 2) +
				(hsn_w + 2) +
				(qty_w + 2) +
				(uom_w + 2) +
				(mrp_w + 2) +
				(discount_percent_w + 2) +
				(amount_w + 2) +
				(igs_tw + 2),
			y,
			{ width: net_w - 1, align: 'right' },
		);
	} else {
		doc.text(
			Number(net_amount).toFixed(2),
			x_start +
				(snow + 2) +
				(product_code_w + 2) +
				(product_desc_w + 2) +
				(hsn_w + 2) +
				(qty_w + 2) +
				(uom_w + 2) +
				(mrp_w + 2) +
				(discount_percent_w + 2) +
				(amount_w + 2) +
				(igs_tw + 2),
			y,
			{ width: net_w - 1, align: 'right' },
		);
	}
}

// FINAL SUMMARY TOTAL LEFT
function generateSummaryLeftTableRow(doc, y, classhead, subtotal, disc, amount, sgs_t, cgs_t, gst, total, is_igs_t, igs_t) {
	doc.fillColor('#000000');
	doc.fontSize(9).text(classhead, 24, y, { width: 40, align: 'left' });
	if (subtotal === 'SUB TOTAL') {
		doc.text(subtotal, 64, y, { width: 50, align: 'right' });
	} else {
		doc.text((+subtotal + +disc).toFixed(2), 64, y, {
			width: 50,
			align: 'right',
		});
	}

	if (disc === 'DISC') {
		doc.text(disc, 113, y, { width: 49, align: 'right' });
	} else {
		doc.text((+disc).toFixed(2), 113, y, { width: 49, align: 'right' });
	}
	if (amount === 'AMOUNT') {
		doc.text(amount, 169, y, { width: 49, align: 'right' });
	} else {
		doc.text((+amount).toFixed(2), 169, y, { width: 49, align: 'right' });
	}

	if (!is_igs_t) {
		if (sgs_t === 'SGST') {
			doc.text(sgs_t, 225, y, { width: 49, align: 'right' });
		} else {
			doc.text((+sgs_t / 2).toFixed(2), 225, y, { width: 49, align: 'right' });
		}

		if (cgs_t === 'CGST') {
			doc.text(cgs_t, 281, y, { width: 49, align: 'right' });
		} else {
			doc.text((+cgs_t / 2).toFixed(2), 281, y, { width: 49, align: 'right' });
		}

		if (gst === 'GST') {
			doc.text(gst, 337, y, { width: 49, align: 'right' });
		} else {
			doc.text((+gst).toFixed(2), 337, y, { width: 49, align: 'right' });
		}
		if (total === 'TOTAL') {
			doc.text(total, 393, y, { width: 49, align: 'right' });
		} else {
			doc.text((+total).toFixed(2), 393, y, { width: 49, align: 'right' });
		}
	} else if (is_igs_t) {
		if (igs_t === 'IGST') {
			doc.text(igs_t, 225, y, { width: 39, align: 'right' });
		} else {
			doc.text((+igs_t).toFixed(2), 225, y, { width: 39, align: 'right' });
		}

		if (gst === 'GST') {
			doc.text(gst, 281, y, { width: 49, align: 'right' });
		} else {
			doc.text((+gst).toFixed(2), 281, y, { width: 49, align: 'right' });
		}

		if (total === 'TOTAL') {
			doc.text(total, 337, y, { width: 49, align: 'right' });
		} else {
			doc.text((+total).toFixed(2), 337, y, { width: 49, align: 'right' });
		}
	}
}
//Final SUMMARY TOTAL RIGHT BOX
function generateSummaryRightTableRow(doc, y, subtotal, discount, sgs_t, cgs_t, finalTotalAllTax, is_igs_t, igs_t, sale_master_data) {
	doc.fillColor('#000000');
	doc.fontSize(9)
		.font('Helvetica-Bold')
		.text('SUB TOTAL', 450, y, { width: 70, align: 'left' })
		.font('Helvetica')
		.text((+subtotal + +discount).toFixed(2), 500, y, {
			width: 70,
			align: 'right',
		})

		.text('DISCOUNT', 450, y + 15, { width: 70, align: 'left' })

		.text((+discount).toFixed(2), 500, y + 15, { width: 70, align: 'right' });

	if (!is_igs_t) {
		doc.text('SGST', 450, y + 30, { width: 70, align: 'left' })

			.text((+sgs_t / 2).toFixed(2), 500, y + 30, { width: 70, align: 'right' })

			.text('CGST', 450, y + 45, { width: 70, align: 'left' })

			.text((+cgs_t / 2).toFixed(2), 500, y + 45, { width: 70, align: 'right' });
	} else if (is_igs_t) {
		doc.text('IGST', 450, y + 30, { width: 70, align: 'left' }).text((+igs_t).toFixed(2), 500, y + 30, { width: 70, align: 'right' });
	}

	doc.text('Misc.', 450, y + 60, { width: 70, align: 'left' }).text(
		(+(+sale_master_data.transport_charges + +sale_master_data.unloading_charges + +sale_master_data.misc_charges)).toFixed(2),
		500,
		y + 60,
		{
			width: 70,
			align: 'right',
		},
	);

	let finalSumTotal = +(
		+finalTotalAllTax +
		+sale_master_data.transport_charges +
		+sale_master_data.unloading_charges +
		+sale_master_data.misc_charges
	);

	doc.text('ROUNDED OFF', 450, y + 75, { width: 70, align: 'left' }).text(
		(roundOffFn(finalSumTotal, 'rounding') - roundOffFn(finalSumTotal, 'without-rounding')).toFixed(2),
		500,
		y + 75,
		{
			width: 70,
			align: 'right',
		},
	);

	doc.font('Helvetica-Bold');
	doc.text('TOTAL', 450, y + 95, { width: 70, align: 'left' })

		.text(roundOffFn(finalSumTotal, 'rounding').toLocaleString('en-IN') + '.00', 500, y + 95, {
			width: 70,
			align: 'right',
		})
		.font('Helvetica');
}

function generateHr(doc, line_x_start, line_x_end, y) {
	doc.strokeColor('#000000').lineWidth(1).moveTo(line_x_start, y).lineTo(line_x_end, y).stroke();
}

function formatCurrency(cents) {
	return '$' + (cents / 100).toFixed(2);
}

function formatDate(date) {
	const day = date.getDate();
	const month = date.getMonth() + 1;
	const year = date.getFullYear();

	return year + '/' + month + '/' + day;
}

function getSumByTaxTypeAndTaxPercent(dataArr, tax_type, tax_percent) {
	return dataArr
		.filter((arr) => {
			if (tax_type === 'igs_t') {
				return arr.igs_t === tax_percent;
			} else if (tax_type === 'cgs_t') {
				return arr.cgs_t === tax_percent / 2;
			} else if (tax_type === 'sgs_t') {
				return arr.sgs_t === tax_percent / 2;
			}
		})
		.reduce((a, c) => {
			return a + c.after_tax_value * (tax_percent / 100);
		}, 0);
}

function getSumByDiscountPercent(dataArr, tax_percent) {
	return dataArr
		.filter((arr) => arr.tax === tax_percent)
		.reduce((a, c) => {
			return Number(a + c.disc_value);
		}, 0);
}

function getSumByTaxableByPercent(dataArr, tax_percent) {
	return dataArr
		.filter((arr) => arr.tax === tax_percent)
		.reduce((a, c) => {
			return Number(a + c.after_tax_value);
		}, 0);
}

function getSumByTotalByPercent(dataArr, tax_percent) {
	return dataArr
		.filter((arr) => arr.tax === tax_percent)
		.reduce((a, c) => {
			return Number(a + c.total_value);
		}, 0);
}

function roundOffFn(value, param) {
	if (param === 'rounding') {
		return Math.round(+value.toFixed(2));
	} else if (param === 'without-rounding') {
		return +value.toFixed(2);
	}
}

module.exports = {
	createInvoice,
};

// Array.from(Array(120)).forEach(function (k, idx) {
