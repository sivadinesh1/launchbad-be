const express = require('express');
const excelRouter = express.Router();

const xlsx = require('xlsx');

excelRouter.get('/sample-xls', (req, res) => {
	console.log('insdie sample xls');
	const wb = xlsx.readFile('./upload/Data.xlsx');

	const ws = wb.Sheets['products'];

	const data = xlsx.utils.sheet_to_json(ws);
	console.log(data);
});

module.exports = excelRouter;
