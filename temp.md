let query = `
INSERT INTO purchase_ledger ( center_id, vendor_id, purchase_ref_id, ledger_detail, debit_amt, balance_amt, ledger_date)
VALUES
( ? , ?, ?, 'Purchase Reversal',
IFNULL((select credit_amt from (select (credit_amt) as credit_amt
FROM purchase_ledger
where center_id = '${insertValues.centerid}'  and vendor_id = '${insertValues.vendorctrl.id}'
and ledger_detail = 'Invoice' and purchase_ref_id = '${purchase_ref_id}'
    ORDER BY  id DESC
		LIMIT 1) a), 0),
		
		(
			
	
	 IFNULL((select balance_amt from (select (balance_amt ) as balance_amt
    FROM purchase_ledger
		where center_id = '${insertValues.centerid}' and vendor_id = '${insertValues.vendorctrl.id}'
		
    ORDER BY  id DESC
		LIMIT 1) a), 0)
		-
		IFNULL((select credit_amt from (select (credit_amt) as credit_amt
			FROM purchase_ledger
			where center_id = '${insertValues.centerid}' and vendor_id = '${insertValues.vendorctrl.id}'
			and ledger_detail = 'purchase' and purchase_ref_id = '${purchase_ref_id}'
ORDER BY id DESC
LIMIT 1) a), 0)
), '${today}'
