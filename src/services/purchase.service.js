const { prisma } = require('../config/prisma');

const {
	toTimeZoneFormat,
	currentTimeInTimeZone,
	promisifyQuery,
} = require('../utils/utils');

// repos
const PurchaseRepo = require('../repos/purchase.repo');
const PurchaseDetailRepo = require('../repos/purchase-detail.repo');
const StockRepo = require('../repos/stock.repo');
const ItemHistoryRepo = require('../repos/item-history.repo');
const ProductRepo = require('../repos/product.repo');
const VendorRepo = require('../repos/vendor.repo');
const PurchaseLedgerRepo = require('../repos/purchase-ledger.repo');
const AuditRepo = require('../repos/audit.repo');

// domain
const { PurchaseLedger } = require('../domain/PurchaseLedger');
const { Audit } = require('../domain/Audit');

const insertPurchase = async (purchaseObject, user_id) => {
	// request object for purchase entry (both add & edit)
	const purchase_object = { ...purchaseObject };

	let purchaseMaster = preparePurchaseMasterObject(purchase_object, user_id);

	try {
		const response = await prisma.$transaction(async (prisma) => {
			let newPK;
			let purchase_master;
			// if purchase_id not present its a add else its edit
			if (purchase_object.purchase_id === '') {
				purchase_master = await PurchaseRepo.addPurchaseMaster(
					purchaseMaster,
					user_id,
					prisma
				);
			} else if (purchase_object.purchase_id !== '') {
				purchase_master = await PurchaseRepo.editPurchaseMaster(
					purchaseMaster,
					user_id,
					prisma
				);
			}

			newPK = purchase_master.id;

			// LOOP & Insert purchase_details (+ few other steps)
			let detailsInserted = await insertPurchaseDetails(
				purchase_object,

				newPK,
				user_id,
				prisma
			);

			if (
				purchase_object.status === 'C' &&
				purchase_object.purchase_id === ''
			) {
				let result = await prepareAndAddPurchaseLedgerEntry(
					purchase_object,
					purchase_master,
					user_id,
					prisma
				);

				let vendor_balance_update = await updateVendorBalanceAmt(
					purchase_object,
					prisma
				);
			} else if (
				purchase_object.status === 'C' &&
				purchase_object.purchase_id !== ''
			) {
				let purchaseLedger =
					await prepareAndAddPurchaseLedgerReversalEntry(
						purchase_object,
						purchase_master,
						user_id,
						prisma
					);

				let purchaseLedger1 =
					await preparePurchaseLedgerEntryAfterReversal(
						purchase_object,
						purchase_master,
						user_id,
						prisma
					);
			}

			return { status: 'success', id: newPK };
		});
		return response;
	} catch (error) {
		console.log('Error while inserting Purchase ' + error.message);
	}
};

function preparePurchaseMasterObject(purchase_object, user_id) {
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
		revision: calculateRevisionCount(
			purchase_object.status,
			purchase_object.revision
		),

		created_by: user_id,
		updated_by: user_id,
	};

	return purchase;
}

calculateRevisionCount = (status, revision) => {
	let revisionCnt = 0;

	// always very first insert will increment revision to 1, on consecutive inserts, it will be +1
	if (status === 'C' && revision === 0) {
		revisionCnt = 1;
	} else if (status === 'C' && revision !== 0) {
		revisionCnt = revision + 1;
	}
	return revisionCnt;
};

const preparePurchaseLedgerEntryAfterReversal = async (
	purchase_object,
	purchase_master,
	user_id,
	prisma
) => {
	let purchaseLedger = PurchaseLedger;
	try {
		let previousBalance = await PurchaseLedgerRepo.getVendorBalance(
			purchase_object.vendor_ctrl.id,
			purchase_object.center_id,
			prisma
		);

		purchaseLedger.center_id = purchase_object.center_id;
		purchaseLedger.vendor_id = purchase_object.vendor_ctrl.id;
		purchaseLedger.purchase_ref_id = purchase_master.id;
		purchaseLedger.ledger_detail = 'purchase';
		purchaseLedger.balance_amt =
			Number(previousBalance) + Number(purchase_object.net_total);
		purchaseLedger.credit_amt = purchase_object.net_total;
		purchaseLedger.created_by = user_id;
		purchaseLedger.updated_by = user_id;

		let result = await PurchaseLedgerRepo.addPurchaseLedgerEntry(
			purchaseLedger,
			prisma
		);

		return result;
	} catch (error) {
		throw new Error(
			`error :: preparePurchaseLedgerEntryAfterReversal purchase.service.js ` +
				error.message
		);
	}
};

const prepareAndAddPurchaseLedgerEntry = async (
	purchase_object,
	purchase_master,
	user_id,
	prisma
) => {
	let purchaseLedger = PurchaseLedger;
	try {
		let previousBalance = await PurchaseLedgerRepo.getVendorBalance(
			purchase_object.vendor_ctrl.id,
			purchase_object.center_id,
			prisma
		);

		purchaseLedger.center_id = purchase_object.center_id;
		purchaseLedger.vendor_id = purchase_object.vendor_ctrl.id;
		purchaseLedger.purchase_ref_id = purchase_master.id;
		purchaseLedger.ledger_detail = 'purchase';
		purchaseLedger.balance_amt =
			Number(previousBalance) + Number(purchase_object.net_total);
		purchaseLedger.credit_amt = purchase_object.net_total;
		purchaseLedger.created_by = user_id;
		purchaseLedger.updated_by = user_id;

		let result = await PurchaseLedgerRepo.addPurchaseLedgerEntry(
			purchaseLedger,
			prisma
		);

		return result;
	} catch (error) {
		throw new Error(
			`error :: prepareAndAddPurchaseLedgerEntry purchase.service.js ` +
				error.message
		);
	}
};

const prepareAndAddPurchaseLedgerReversalEntry = async (
	purchase_object,
	purchase_master,
	user_id,
	prisma
) => {
	try {
		let previousBalance = await PurchaseLedgerRepo.getVendorBalance(
			purchase_object.vendor_ctrl.id,
			purchase_object.center_id,
			prisma
		);

		let debit_amt =
			await PurchaseLedgerRepo.getCreditAmtForPurchaseReversal(
				purchase_object.vendor_ctrl.id,
				purchase_object.center_id,
				purchase_master.id,
				prisma
			);

		let purchaseLedger = PurchaseLedger;
		purchaseLedger.center_id = purchase_object.center_id;
		purchaseLedger.vendor_id = purchase_object.vendor_ctrl.id;
		purchaseLedger.purchase_ref_id = purchase_master.id;
		purchaseLedger.ledger_detail = 'Purchase Reversal';
		(purchaseLedger.debit_amt = debit_amt),
			(purchaseLedger.balance_amt =
				Number(previousBalance) - Number(debit_amt));
		purchaseLedger.credit_amt = 0.0;
		purchaseLedger.created_by = user_id;
		purchaseLedger.updated_by = user_id;

		let result = await PurchaseLedgerRepo.addPurchaseLedgerEntry(
			purchaseLedger,
			prisma
		);

		return result;
	} catch (error) {
		throw new Error(
			`error :: prepareAndAddPurchaseLedgerReversalEntry purchase.service.js ` +
				error.message
		);
	}
};

async function insertPurchaseDetails(
	purchase_object,

	newPK,
	user_id,
	prisma
) {
	try {
		for await (const product_item of purchase_object.product_arr) {
			// check if productId + mrp exist, if exists (count ===1) then update stock else create new stock
			//	let stock_id_Exist = await StockRepo.isStockIdExist(k, res);

			let stock_id_Exist = await StockRepo.getStockId(
				product_item.product_id,
				product_item.mrp,
				prisma
			);

			console.log('dinesh stock id exist:' + stock_id_Exist);
			console.log(
				'dinesh22 stock id exist:' + JSON.stringify(stock_id_Exist)
			);

			console.log(
				'dinesh22 33stock id exist:' +
					JSON.stringify(stock_id_Exist.length)
			);

			if (
				`${product_item.mrp_change_flag}` === 'Y' &&
				stock_id_Exist.length === 0
			) {
				// get pur_det_id for both insert and update - check
				// if insert its: data.insertId
				// for update its k.k.pur_det_id

				// if mrp flag is true the insert new record to stocks
				// 	insert into stock (product_id, mrp, available_stock, open_stock, updatedAt)
				// 	values ('${k.product_id}', '${k.mrp}', '${k.quantity}', 0, '${todayYYMMDD}')`;
				let stock = {
					product_id: product_item.product_id,
					mrp: product_item.mrp,
					available_stock: product_item.quantity,
					open_stock: 0,
					center_id: purchase_object.center_id,
					user_id: user_id,
				};

				let stock_id = await StockRepo.insertToStock(stock, prisma);
			}

			let purchase_detail = await preparePurchaseDetail(
				purchase_object,
				product_item,
				newPK,
				user_id,
				prisma
			);

			let product_detail_add_obj;
			if (product_item.pur_det_id === '') {
				product_detail_add_obj =
					await PurchaseDetailRepo.addPurchaseDetail(
						purchase_detail,
						prisma
					);
			} else {
				await PurchaseDetailRepo.editPurchaseDetail(
					purchase_detail,
					prisma
				);
			}

			let inserted_latest_PurchasePrice =
				await ProductRepo.updateLatestPurchasePrice(
					purchase_detail.purchase_price,
					purchase_detail.mrp,
					purchase_detail.product_id,
					prisma
				);

			let p_detail_id =
				product_item.pur_det_id === ''
					? product_detail_add_obj.id
					: product_item.pur_det_id;

			// let stock_id_Exist = await StockRepo.getStockId(
			// 	product_item.product_id,
			// 	product_item.mrp,
			// 	prisma
			// );

			// check if productId + mrp exist, if exists (count ===1) then update stock else create new stock
			//	let stock_id_Exist = await StockRepo.isStockIdExist(k, res);

			if (
				`${product_item.mrp_change_flag}` === 'N' ||
				(`${product_item.mrp_change_flag}` === 'Y' &&
					stock_id_Exist.length > 0)
			) {
				// else update the stock tbl, only of the status is "C - completed", draft should be ignored

				//	if (cloneReq.status === "C") {
				// update stock for both status C & D (Completed & Draft)
				let qty_to_update =
					product_item.quantity - product_item.old_val;

				// Update Stock Table
				let is_updated = await StockRepo.stockAdd(
					qty_to_update,
					purchase_detail.stock_id,
					purchase_detail.updated_by,
					prisma
				);
			}

			let is_updated =
				await PurchaseDetailRepo.updatePurchaseDetailStockMRPChange(
					p_detail_id,
					purchase_detail.stock_id,
					prisma
				);

			let item_history = await prepareItemHistory(
				product_item,
				newPK,
				p_detail_id,
				purchase_object,
				user_id,
				prisma
			);

			if (item_history.txn_qty !== 0) {
				let item_history_add_obj = await ItemHistoryRepo.addItemHistory(
					item_history,
					prisma
				);
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
	user_id,
	prisma
) => {
	let result = await StockRepo.getStockId(
		product_item.product_id,
		product_item.mrp,
		prisma
	);

	let purchase = {
		pur_det_id: product_item.pur_det_id,
		center_id: purchase_object.center_id,
		purchase_id: newPK,
		product_id: product_item.product_id,
		quantity: product_item.quantity,
		hsn_code: product_item.hsn_code,
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
		created_by: user_id,
		updated_by: user_id,
	};

	return purchase;
};

// UPDATE PRODUCT TABLE when purchasing, for company both unit_price (use in sales screen reports) & purchase_price are same

//vPurchase_id - purchase_id && vPurchase_det_id - new purchase_detail id
// k - looped purchase details array
const prepareItemHistory = async (
	item,
	vPurchase_id,
	vPurchase_det_id,
	purchase_object,
	user_id,
	prisma
) => {
	const product_count = await StockRepo.stockCount(item.product_id, prisma);

	let purchase = 'Purchase';
	// if purchase details id is missing its new else update
	let purchase_det_id =
		item.pur_det_id === '' ? vPurchase_det_id : item.pur_det_id;
	let txn_quantity =
		item.pur_det_id === '' ? item.quantity : item.quantity - item.old_val;
	// let action_type = "ADD";
	let purchase_id = vPurchase_id === '' ? item.purchase_id : vPurchase_id;

	// scenario: purchase added > draft status > now create purchase entry. txn_quantity will be zero, because old_val & current_val will be same
	// this is a fix for above scenario
	if (purchase_object.revision === 0 && txn_quantity === 0) {
		txn_quantity = item.quantity;
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
		action_type = `Edited: ${item.old_val} To: ${item.quantity}`;
		txn_quantity = item.old_val - item.quantity;
	} else if (txn_quantity > 0 && purchase_object.revision > 0) {
		action_type = `Edited: ${item.old_val} To: ${item.quantity}`;
		txn_quantity = item.quantity - item.old_val;
	}

	if (item.mrp_change_flag === 'Y') {
		purchase = purchase + ' MRP Change - ' + item.mrp;
	}

	let itemHistory = {
		center_id: purchase_object.center_id,
		module: purchase,
		product_ref_id: item.product_id,
		sale_id: '0',
		sale_det_id: '0',
		action: 'PUR',
		action_type: action_type,
		mrp: item.mrp,
		txn_qty: txn_quantity,
		stock_level: product_count,
		txn_date: new Date(),
		sale_return_id: 0,
		sale_return_det_id: 0,
		purchase_id: purchase_id,
		purchase_det_id: purchase_det_id,
		purchase_return_id: 0,
		purchase_return_det_id: 0,

		created_by: user_id,
	};

	return itemHistory;
};

const updateVendorBalanceAmt = async (purchase_object, prisma) => {
	try {
		let balanceAmt = await PurchaseLedgerRepo.getVendorBalance(
			purchase_object.vendor_ctrl.id,
			purchase_object.center_id,
			prisma
		);

		let result91 = await VendorRepo.updateVendorBalance(
			purchase_object.vendor_ctrl.id,
			balanceAmt,
			prisma
		);

		return { status: 'vendor_balance_updated' };
	} catch (error) {
		throw new Error(
			`error :: updateVendorBalanceAmt purchase.service.js ` +
				error.message
		);
	}
};

// 1. Insert into audit
// 2. Delete from purchase_details
// 3. Update stock table
// 4. Update History table
// 5. Update vendor balance table (should it be done? - not yet done)
const deletePurchaseDetails = async (requestBody, center_id, user_id) => {
	let purchase_detail_id = requestBody.pur_det_id;
	let purchase_id = requestBody.purchase_id;
	let quantity = requestBody.quantity;
	let product_id = requestBody.product_id;
	let stock_id = requestBody.stock_id;
	let mrp = requestBody.mrp;

	try {
		const response = await prisma.$transaction(async (prisma) => {
			// 1. Insert into audit
			let result = await prepareAndDoPurchaseDeleteAudit(
				center_id,
				purchase_detail_id,
				purchase_id,

				user_id,
				prisma
			);

			//	2. Delete from purchase_details
			let result1 = await PurchaseDetailRepo.deletePurchaseDetailById(
				purchase_detail_id,
				prisma
			);

			// 3. Update stock table
			let result2 = await StockRepo.stockMinus(
				quantity,
				stock_id,
				user_id,
				prisma
			);

			// 4. add History table
			let item_history = await prepareItemHistoryDelete(
				center_id,
				purchase_id,
				purchase_detail_id,
				product_id,
				stock_id,
				quantity,
				mrp,
				user_id,
				prisma
			);

			let result3 = await ItemHistoryRepo.addItemHistory(
				item_history,
				prisma
			);

			return {
				result: 'success',
			};
		});
		return response;
	} catch (error) {
		console.log(
			'Error while deletePurchaseDetails purchase.service.js ' + error
		);
		throw error;
	}
};

const prepareItemHistoryDelete = async (
	center_id,
	purchase_id,
	purchase_detail_id,
	product_id,
	stock_id,
	quantity,
	mrp,
	user_id,
	prisma
) => {
	const product_count = await StockRepo.stockCount(product_id, prisma);

	let itemHistory = {
		center_id: center_id,
		module: 'Purchase',
		product_ref_id: product_id,
		sale_id: '0',
		sale_det_id: '0',
		action: 'PUR',
		action_type: `Deleted`,
		mrp: `${mrp}`,

		txn_qty: quantity,
		stock_level: product_count,
		txn_date: new Date(),
		sale_return_id: 0,
		sale_return_det_id: 0,
		purchase_id: purchase_id,
		purchase_det_id: purchase_detail_id,
		purchase_return_id: 0,
		purchase_return_det_id: 0,

		created_by: user_id,
	};

	return itemHistory;
};

async function prepareAndDoPurchaseDeleteAudit(
	center_id,
	purchase_detail_id,
	purchase_id,

	user_id,
	prisma
) {
	let old_value = await PurchaseRepo.getOldValue(purchase_detail_id, prisma);

	try {
		let audit = {
			center_id: center_id,
			revision: 0,
			module: 'Purchase',
			module_ref_id: purchase_id,
			module_ref_det_id: purchase_detail_id,
			action: 'delete',
			old_value: old_value,
			new_value: '',
			created_by: user_id,
			updated_by: user_id,
		};

		let auditResult = await AuditRepo.addAudit(audit, prisma);

		return audit;
	} catch (error) {
		throw new Error(
			`error :: prepareAndAddPurchaseDeleteAudit purchase.service.js ` +
				error.message
		);
	}
}

module.exports = {
	insertPurchase,
	deletePurchaseDetails,
};
