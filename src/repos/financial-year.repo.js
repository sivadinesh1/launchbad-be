const { prisma } = require('../config/prisma');

const { formatSequenceNumber, currentTimeInTimeZone, bigIntToString, escapeText, promisifyQuery } = require('../utils/utils');

const financialYearRepoGetFinancialYearRow = async (center_id, prisma) => {
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

const financialYearRepoGetNextInvSequenceNo = async (center_id) => {
	let rowId = await this.getFinancialYearRow(center_id, prisma); // get the row id

	const result = await prisma.financial_year.findUnique({
		where: {
			id: Number(rowId),
		},
		select: {
			inv_seq: true,
		},
	});

	console.log('object::dinesh: ' + result?.inv_seq);

	let nextInvNo = formatSequenceNumber((Number(result?.inv_seq) + 1).toString());

	return nextInvNo;
};

const financialYearRepoGetNextStockIssueSequenceNoasync = async (center_id) => {
	let rowId = await this.getFinancialYearRow(center_id, prisma); // get the row id

	const result = await prisma.financial_year.findUnique({
		where: {
			id: Number(rowId),
		},
		select: {
			stock_issue_seq: true,
		},
	});

	let nextInvNo = formatSequenceNumber((Number(result?.stock_issue_seq) + 1).toString(), 'SI-');

	return nextInvNo;
};

const financialYearRepoUpdateInvoiceSequence = async (center_id, prisma) => {
	let rowId = await this.getFinancialYearRow(center_id, prisma); // get the row id

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

const financialYearRepoUpdateDraftInvoiceSequenceGenerator = async (center_id, prisma) => {
	let rowId = await this.getFinancialYearRow(center_id, prisma); // get the row id

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

const financialYearRepoUpdateStockIssueSequenceGenerator = async (center_id, prisma) => {
	let rowId = await this.getFinancialYearRow(center_id, prisma); // get the row id
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
	financialYearRepoGetFinancialYearRow,
	financialYearRepoGetNextInvSequenceNo,
	financialYearRepoGetNextStockIssueSequenceNoasync,
	financialYearRepoUpdateInvoiceSequence,
	financialYearRepoUpdateDraftInvoiceSequenceGenerator,
	financialYearRepoUpdateStockIssueSequenceGenerator,
};

// const user = await prisma.user.findFirst({
//   where: {
//     OR: [{ username }, { email }],
//   },
// });
