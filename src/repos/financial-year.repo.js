const { prisma } = require('../config/prisma');

const {
	formatSequenceNumber,
	currentTimeInTimeZone,
	bigIntToString,
	escapeText,
	promisifyQuery,
} = require('../utils/utils');

const getFinancialYearRow = async (center_id, prisma) => {
	const recordToUpdate = await prisma.financial_year.findMany({
		where: {
			center_id: Number(center_id),
			start_date: {
				lt: new Date(),
			},
			end_date: {
				gt: new Date(),
			},
		},
	});

	return recordToUpdate[0].id;
};

const getNextInvSequenceNo = async (center_id) => {
	let rowId = await financialYearRepoGetFinancialYearRow(center_id, prisma); // get the row id

	const result = await prisma.financial_year.findUnique({
		where: {
			id: Number(rowId),
		},
		select: {
			inv_seq: true,
		},
	});

	let nextInvNo = formatSequenceNumber(
		(Number(result?.inv_seq) + 1).toString()
	);

	return nextInvNo;
};

const getNextStockIssueSequenceNoAsync = async (center_id) => {
	let rowId = await financialYearRepoGetFinancialYearRow(center_id, prisma); // get the row id

	const result = await prisma.financial_year.findUnique({
		where: {
			id: Number(rowId),
		},
		select: {
			stock_issue_seq: true,
		},
	});

	let nextInvNo = formatSequenceNumber(
		(Number(result?.stock_issue_seq) + 1).toString(),
		'SI-'
	);

	return nextInvNo;
};

const updateInvoiceSequence = async (center_id, prisma) => {
	let rowId = await financialYearRepoGetFinancialYearRow(center_id, prisma); // get the row id

	const result = await prisma.financial_year.update({
		where: {
			id: Number(rowId),
		},
		data: {
			inv_seq: {
				increment: 1,
			},
		},
	});

	return bigIntToString(result);
};

const updateDraftInvoiceSequenceGenerator = async (center_id, prisma) => {
	let rowId = await financialYearRepoGetFinancialYearRow(center_id, prisma); // get the row id

	const result = await prisma.financial_year.update({
		where: {
			id: Number(rowId),
		},
		data: {
			draft_inv_seq: {
				increment: 1,
			},
		},
	});

	return bigIntToString(result);
};

const updateStockIssueSequenceGenerator = async (center_id, prisma) => {
	let rowId = await financialYearRepoGetFinancialYearRow(center_id, prisma); // get the row id
	const result = await prisma.financial_year.update({
		where: {
			center_id: Number(rowId),
			start_date: {
				lt: new Date(),
			},
			end_date: {
				gt: new Date(),
			},
		},
		data: {
			stock_issue_seq: {
				increment: 1,
			},
		},
	});

	return bigIntToString(result);
};

module.exports = {
	getFinancialYearRow,
	getNextInvSequenceNo,
	getNextStockIssueSequenceNoAsync,
	updateInvoiceSequence,
	updateDraftInvoiceSequenceGenerator,
	updateStockIssueSequenceGenerator,
};

// const user = await prisma.user.findFirst({
//   where: {
//     OR: [{ username }, { email }],
//   },
// });
