'use strict';

const csv = require('fast-csv');
const async = require('async');

const SUPPORTED_OPERATIONS = ['max', 'min', 'empty'];

const argv = require('optimist')
	.usage('Do something with some column in a CSV file.\nUsage: $0')
	.demand('f').alias('f', 'file').describe('f', 'CSV file to process')
	.demand('c').alias('c', 'column').describe('c', 'Column number')
	.demand('o').alias('o', 'operation').describe('o', 'Operation to be performed '
		+ 'on that column. Supported operations: '+SUPPORTED_OPERATIONS.join(', '))
	.argv;

argv.c = Number.parseInt(argv.c);
if (Number.isNaN(argv.c) || argv.c <= 0) {
	console.error('Column number must be a positive integer!');
	process.exit(1);
}

if (SUPPORTED_OPERATIONS.indexOf(argv.o) === -1) {
	console.error('Given operation is not supported! '
		+ 'Supported operations: '+SUPPORTED_OPERATIONS.join(', '));
	process.exit(1);
}

const csvPromise = parseCsv(argv.f);
csvPromise.then((rows) => {
	const result = processRows(rows, argv.c, argv.o);
	var r = csv.writeToString(result, (err, str) => console.log(str));
}, (err) => console.error(err));

function processRows(rows, columnNo, operation) {
	if (operation === 'empty') {
		return rows.filter((row) => {
			if (row.length > columnNo-1) {
				return row[columnNo-1] === '';
			}
			else return true;
		});
	}
}

function parseCsv(file) {
	return new Promise((resolve, reject) =>  {
		let rows = [];

		csv
			.fromPath(file)
			.on('data', (row) => {
				rows.push(row);
			})
			.on('end', () => {
				resolve(rows);
			})
			.on('error', reject);
	});
}
