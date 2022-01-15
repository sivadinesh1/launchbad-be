var pool = require('../config/db');
const { prisma } = require('../config/prisma');

const { handleError, ErrorHandler } = require('../config/error');

const {
	toTimeZoneFormat,
	currentTimeInTimeZone,
	promisifyQuery,
} = require('../utils/utils');

const {
	addPurchaseMaster,
	editPurchaseMaster,
} = require('../repos/purchase.repo');
const {
	addPurchaseDetail,
	editPurchaseDetail,
} = require('../repos/purchase-detail.repo');

// const {
// 	getStockId,
// 	addStock,
// 	stockCount,
// 	stockCorrection,
// 	stockMinus,
// 	stockAdd,
// } = require('../repos/stock.repo');

const StockRepo = require('../repos/stock.repo');

const {
	productRepoUpdateLatestPurchasePrice,
} = require('../repos/product.repo');
const {
	addPurchaseLedgerEntry,
	getVendorBalance,
	getCreditAmtForPurchaseReversal,
	updatePurchaseLedgerVendorChange,
} = require('../repos/purchase-ledger.repo');

const { PurchaseLedger } = require('../domain/PurchaseLedger');

const { updateVendorBalance } = require('../repos/vendor.repo');

const insertPurchase = async (purchaseObject) => {
	const purchase_object = { ...purchaseObject };
	try {
		const status = await prisma.$transaction(async (prisma) => {
			let purchaseMaster = preparePurchaseMasterObject(purchase_object);
			console.log('dinesh 11');
			let newPK;
			let purchase_master;

			if (purchase_object.purchase_id === '') {
				purchase_master = await addPurchaseMaster(
					purchaseMaster,
					prisma
				);
			} else if (purchase_object.purchase_id !== '') {
				purchase_master = await editPurchaseMaster(
					purchaseMaster,
					prisma
				);
			}
			console.log('dineshZ1');
			newPK = purchase_master.id;
			console.log('PK generated: ' + JSON.stringify(newPK));

			let detailsInserted = await insertPurchaseDetails(
				purchase_object,
				purchase_master,
				newPK,
				prisma
			);

			console.log('Purchase details entry done: ' + detailsInserted);

			if (
				purchase_object.status === 'C' &&
				purchase_object.purchase_id === ''
			) {
				let result = await prepareAndAddPurchaseLedgerEntry(
					purchase_object,
					purchase_master,
					prisma
				);
				console.log(
					'after prepare and purchase ledger entry: ' + result
				);
				let result991 = await updateVendorBalanceAmt(
					purchase_object,
					prisma
				);
				console.log('after vendor balance amount : ' + result991);
			} else if (
				purchase_object.status === 'C' &&
				purchase_object.purchase_id !== ''
			) {
				let purchaseLedger =
					await prepareAndAddPurchaseLedgerReversalEntry(
						purchase_object,
						purchase_master,
						prisma
					);

				let purchaseLedger1 =
					await preparePurchaseLedgerEntryAfterReversal(
						purchase_object,
						purchase_master,
						prisma
					);
			}

			console.log('final status:: ' + newPK);
			return { status: 'success', id: newPK };
		});
		return status;
	} catch (error) {
		console.log('Error while inserting Purchase ' + error);
	} finally {
		prisma.$disconnect();
	}
};

function preparePurchaseMasterObject(purchase_object) {
	let revisionCnt = 0;

	// always very first insert will increment revision to 1, on consecutive inserts, it will be +1
	if (purchase_object.status === 'C' && purchase_object.revision === 0) {
		revisionCnt = 1;
	} else if (
		purchase_object.status === 'C' &&
		purchase_object.revision !== 0
	) {
		revisionCnt = purchase_object.revision + 1;
	}

	let purchase = {
		purchase_id:
			purchase_object.purchase_id === ''
				? undefined
				: purchase_object.purchase_id,
		center_id: purchase_object.center_id,
		vendor_id: purchase_object.vendor_ctrl.id,
		invoice_no: purchase_object.invoice_no,
		invoice_date:
			purchase_object.invoice_date !== null ||
			purchase_object.invoice_date !== ''
				? toTimeZoneFormat(purchase_object.invoice_date, 'YYYY-MM-DD')
				: undefined,
		lr_no: purchase_object.lr_no,

		lr_date:
			purchase_object.lr_date !== null && purchase_object.lr_date !== ''
				? toTimeZoneFormat(purchase_object.lr_date, 'YYYY-MM-DD')
				: undefined,

		received_date:
			purchase_object.received_date !== null
				? toTimeZoneFormat(purchase_object.received_date, 'YYYY-MM-DD')
				: undefined,

		order_no: purchase_object.order_no,
		order_date:
			purchase_object.order_date !== null &&
			purchase_object.order_date !== ''
				? toTimeZoneFormat(purchase_object.order_date, 'YYYY-MM-DD')
				: undefined,

		total_quantity: purchase_object.total_quantity,
		no_of_items: purchase_object.no_of_items,
		after_tax_value: purchase_object.after_tax_value,
		cgs_t: purchase_object.cgs_t,
		sgs_t: purchase_object.sgs_t,
		igs_t: purchase_object.igs_t,
		total_value: purchase_object.total_value,
		transport_charges: purchase_object.transport_charges,
		unloading_charges: purchase_object.unloading_charges,
		misc_charges: purchase_object.misc_charges,
		net_total: purchase_object.net_total,
		no_of_boxes: purchase_object.no_of_boxes,
		status: purchase_object.status,

		round_off: purchase_object.round_off,
		revision: revisionCnt,

		created_by: purchase_object.updated_by,
		updated_by: purchase_object.updated_by,
	};
	console.log('dinesh 33 ' + purchase);
	return purchase;
}

function preparePurchaseLedgerEntryAfterReversal(
	purchase_object,
	purchase_master,
	prisma
) {
	return new Promise(async (resolve, reject) => {
		let purchaseLedger = PurchaseLedger;
		try {
			let previousBalance = await getVendorBalance(
				purchase_object.vendor_ctrl.id,
				purchase_object.center_id,
				prisma
			);

			console.log('object prev bal: ' + previousBalance);
			console.log(
				'object purchase_object.net_total bal: ' +
					purchase_object.net_total
			);

			purchaseLedger.center_id = purchase_object.center_id;
			purchaseLedger.vendor_id = purchase_object.vendor_ctrl.id;
			purchaseLedger.purchase_ref_id = purchase_master.id;
			purchaseLedger.ledger_detail = 'purchase';
			purchaseLedger.balance_amt =
				Number(previousBalance) + Number(purchase_object.net_total);
			purchaseLedger.credit_amt = purchase_object.net_total;
			purchaseLedger.created_by = purchase_object.updated_by;
			purchaseLedger.updated_by = purchase_object.updated_by;

			let result = await addPurchaseLedgerEntry(purchaseLedger, prisma);

			resolve(result);
		} catch (error) {
			console.log('error in prepareSaleLedgerEntry:: ' + error);
			reject(error);
		}
	});
}

function prepareAndAddPurchaseLedgerEntry(
	purchase_object,
	purchase_master,
	prisma
) {
	return new Promise(async (resolve, reject) => {
		let purchaseLedger = PurchaseLedger;
		try {
			let previousBalance = await getVendorBalance(
				purchase_object.vendor_ctrl.id,
				purchase_object.center_id,
				prisma
			);

			console.log('object prev bal: ' + previousBalance);
			console.log(
				'object purchase_object.net_total bal: ' +
					purchase_object.net_total
			);

			purchaseLedger.center_id = purchase_object.center_id;
			purchaseLedger.vendor_id = purchase_object.vendor_ctrl.id;
			purchaseLedger.purchase_ref_id = purchase_master.id;
			purchaseLedger.ledger_detail = 'purchase';
			purchaseLedger.balance_amt =
				Number(previousBalance) + Number(purchase_object.net_total);
			purchaseLedger.credit_amt = purchase_object.net_total;
			purchaseLedger.created_by = purchase_object.updated_by;
			purchaseLedger.updated_by = purchase_object.updated_by;

			let result = await addPurchaseLedgerEntry(purchaseLedger, prisma);

			resolve(result);
		} catch (error) {
			console.log('error in prepareSaleLedgerEntry:: ' + error);
			reject(error);
		}
	});
}

function prepareAndAddPurchaseLedgerReversalEntry(
	purchase_object,
	purchase_master,
	prisma
) {
	return new Promise(async (resolve, reject) => {
		let purchaseLedger = PurchaseLedger;
		try {
			let previousBalance = await getVendorBalance(
				purchase_object.vendor_ctrl.id,
				purchase_object.center_id,
				prisma
			);

			let debit_amt = await getCreditAmtForPurchaseReversal(
				purchase_object.vendor_ctrl.id,
				purchase_object.center_id,
				purchase_master.id,
				prisma
			);

			purchaseLedger.center_id = purchase_object.center_id;
			purchaseLedger.vendor_id = purchase_object.vendor_ctrl.id;
			purchaseLedger.purchase_ref_id = purchase_master.id;
			purchaseLedger.ledger_detail = 'Purchase Reversal';
			(purchaseLedger.debit_amt = debit_amt),
				(purchaseLedger.balance_amt =
					Number(previousBalance) - Number(debit_amt));
			purchaseLedger.credit_amt = 0.0;
			purchaseLedger.created_by = purchase_object.updated_by;
			purchaseLedger.updated_by = purchase_object.updated_by;

			let result = await addPurchaseLedgerEntry(purchaseLedger, prisma);

			resolve(result);
		} catch (error) {
			console.log('error in prepareSaleLedgerEntry:: ' + error);
			reject(error);
		}
	});
}

async function insertPurchaseDetails(
	purchase_object,
	purchase_master,
	newPK,
	prisma
) {
	try {
		for await (const product_item of purchase_object.product_arr) {
			let purchase_detail = await preparePurchaseDetail(
				purchase_object,
				product_item,
				newPK,
				prisma
			);

			console.log(
				'::purchase_detail:: ' + JSON.stringify(purchase_detail)
			);
			let product_detail_add_obj;
			if (product_item.pur_det_id === '') {
				product_detail_add_obj = await addPurchaseDetail(
					purchase_detail,
					prisma
				);
			} else {
				await editPurchaseDetail(purchase_detail, prisma);
			}

			console.log('after add purchase detail: ');

			let inserted_latest_PurchasePrice =
				await productRepoUpdateLatestPurchasePrice(
					purchase_detail.purchase_price,
					purchase_detail.mrp,
					purchase_detail.product_id,
					prisma
				);

			console.log(
				'Update product latest purchase price: ' +
					JSON.stringify(inserted_latest_PurchasePrice)
			);

			let p_detail_id =
				product_item.pur_det_id === ''
					? product_detail_add_obj.id
					: product_item.pur_det_id;

			let stock_id_Exist = await StockRepo.getStockId(
				product_item.product_id,
				product_item.mrp,
				prisma
			);

			// console.log('print result :: ' + JSON.stringify(result));

			// check if productId + mrp exist, if exists (count ===1) then update stock else create new stock
			//	let stock_id_Exist = await StockRepo.isStockIdExist(k, res);

			if (
				`${product_item.mrp_change_flag}` === 'Y' &&
				stock_id_Exist === 0
			) {
				// get pur_det_id for both insert and update - check
				// if insert its: data.insertId
				// for update its k.k.pur_det_id

				// if mrp flag is true the insert new record to stocks
				let stock_id = await insertStock(k);
				let is_updated = await updatePurchaseDetail(
					p_detail_id,
					purchase_detail.stock_id
				);
				//		insertItemHistory(product_item, newPK, data.insertId, cloneReq);
			} else {
				// else update the stock tbl, only of the status is "C - completed", draft should be ignored

				//	if (cloneReq.status === "C") {
				// update stock for both status C & D (Completed & Draft)
				let qty_to_update =
					product_item.quantity - product_item.old_val;
				// const stockAdd = async (qty_to_update, stock_pk, updated_by, prisma) => {
				let is_updated = StockRepo.stockAdd(
					qty_to_update,
					purchase_detail.stock_id,
					purchase_detail.updated_by,
					prisma
				);

				// let is_updated = await updateStock(
				// 	qty_to_update,
				// 	product_item.product_id,
				// 	product_item.mrp,
				// 	'add',
				// 	res
				// );
				//		insertItemHistory(k, newPK, data.insertId, cloneReq);

				//		}
			}
		}
		return 'success';
	} catch (error) {
		throw new Error(`Errored while inserting purchase..` + error.message);
	}
}

const preparePurchaseDetail = async (
	purchase_object,
	product_item,
	newPK,
	prisma
) => {
	let result = await StockRepo.getStockId(
		product_item.product_id,
		product_item.mrp,
		prisma
	);

	console.log('print result :: ' + JSON.stringify(result));

	return new Promise(function (resolve, reject) {
		let purchase = {
			pur_det_id: product_item.pur_det_id,
			center_id: purchase_object.center_id,
			purchase_id: newPK,
			product_id: product_item.product_id,
			quantity: product_item.quantity,
			purchase_price: product_item.purchase_price,
			mrp: product_item.mrp,
			batch_date: currentTimeInTimeZone('DD-MM-YYYY'),
			tax: product_item.tax,
			igs_t: product_item.igs_t,
			cgs_t: product_item.cgs_t,
			sgs_t: product_item.sgs_t,
			after_tax_value: product_item.after_tax_value,
			total_value: product_item.total_value,
			stock_id: result[0].id,
			created_by: purchase_object.updated_by,
			updated_by: purchase_object.updated_by,
		};
		resolve(purchase);
	});
};

function insertStock(k) {
	todayYYMMDD = currentTimeInTimeZone('YYYY-MM-DD');
	let query2 = `
	insert into stock (product_id, mrp, available_stock, open_stock, updatedAt)
	values ('${k.product_id}', '${k.mrp}', '${k.quantity}', 0, '${todayYYMMDD}')`;

	return new Promise(function (resolve, reject) {
		pool.query(query2, function (err, data) {
			if (err) {
				return reject(
					new ErrorHandler(
						'500',
						`Error insertStock in Purchase js. ${query2}`,
						err
					),
					res
				);
			} else {
				resolve(data.insertId);
			}
		});
	});
}

function updatePurchaseDetail(purchaseDetailId, stockid) {
	todayYYMMDD = currentTimeInTimeZone('YYYY-MM-DD');

	let query3 = `

			update purchase_detail set stock_id =  '${stockid}'
			where id  = '${purchaseDetailId}' `;

	return new Promise(function (resolve, reject) {
		pool.query(query3, function (err, data) {
			if (err) {
				return reject(
					new ErrorHandler(
						'500',
						'Error updatePurchaseDetail in Purchasejs.',
						err
					),
					res
				);
			} else {
				resolve('purchase_detail_updated');
			}
		});
	});
}

// UPDATE PRODUCT TABLE when purchasing, for company both unit_price (use in sales screen reports) & purchase_price are same
const updateLatestPurchasePrice = (k) => {
	let query2 = `

update product set purchase_price = '${k.purchase_price}', unit_price = '${k.purchase_price}', mrp = '${k.mrp}'
where id = '${k.product_id}'  `;

	pool.query(query2, function (err, data) {
		if (err) {
			console.log(
				'error while inserting updateLatestPurchasePrice ' +
					JSON.stringify(err)
			);
		} else {
			//updated mrp/purchase price in product table
		}
	});
};

//vPurchase_id - purchase_id && vPurchase_det_id - new purchase_detail id
// k - looped purchase details array
const insertItemHistory = async (
	k,
	vPurchase_id,
	vPurchase_det_id,
	cloneReq,
	res
) => {
	let today = currentTimeInTimeZone('DD-MM-YYYY HH:mm:ss');
	let purchase = 'Purchase';
	// if purchase details id is missing its new else update
	let purchase_det_id = k.pur_det_id === '' ? vPurchase_det_id : k.pur_det_id;
	let txn_quantity =
		k.pur_det_id === '' ? k.quantity : k.quantity - k.old_val;
	// let action_type = "ADD";
	let purchase_id = vPurchase_id === '' ? k.purchase_id : vPurchase_id;

	// scenario: purchase added > draft status > now create purchase entry. txn_quantity will be zero, because old_val & current_val will be same
	// this is a fix for above scenario
	if (cloneReq.revision === 0 && txn_quantity === 0) {
		txn_quantity = k.quantity;
	}

	//let purchase_det_id = k.pur_det_id;
	//let txn_quantity = k.quantity;
	let action_type = 'Purchased';
	//	let purchase_id = k.purchase_id;

	//txn -ve means subtract from quantity
	// if (txn_quantity < 0) {
	// 	action_type = 'Mod/Del';
	// }

	if (txn_quantity < 0) {
		action_type = `Edited: ${k.old_val} To: ${k.quantity}`;
		txn_quantity = k.old_val - k.quantity;
	} else if (txn_quantity > 0 && cloneReq.revision > 0) {
		action_type = `Edited: ${k.old_val} To: ${k.quantity}`;
		txn_quantity = k.quantity - k.old_val;
	}

	if (k.mrp_change_flag === 'Y') {
		purchase = purchase + ' MRP Change - ' + k.mrp;
	}

	if (txn_quantity !== 0) {
		let itemHistory = await insertItemHistoryTable(
			cloneReq.center_id,
			purchase,
			k.product_id,
			purchase_id,
			purchase_det_id, //purchase_det_id
			'0', // sale_id
			'0', //sale_det_id
			'PUR',
			action_type,
			txn_quantity, //txn_quantity
			'0', // sale_return_id
			'0', // sale_return_det_id
			'0', // purchase_return_id
			'0', // purchase_return_det_id
			res
		);
	}
};

function updateVendorBalanceAmt(purchase_object, prisma) {
	return new Promise(async (resolve, reject) => {
		try {
			let balanceAmt = await getVendorBalance(
				purchase_object.vendor_ctrl.id,
				purchase_object.center_id,
				prisma
			);

			let result91 = await updateVendorBalance(
				purchase_object.vendor_ctrl.id,
				balanceAmt,
				prisma
			);
			resolve('success');
		} catch (error) {
			reject(error);
		}
	});
}

module.exports = {
	insertPurchase,
};
