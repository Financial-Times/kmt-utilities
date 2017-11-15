require('dotenv').config({silent: true});

const fs = require('fs');
const paths = [
	`${__dirname}/lib/middleware`,
	`${__dirname}/lib/helpers`,
	//`${__dirname}/lib`
];

paths.forEach(function (path) {
	fs.readdirSync(path).forEach(function (file) {
		if (~file.indexOf('.js')) {
			require(`${path}/${file}`);
		}
	});
});
