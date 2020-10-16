var mysql = require('mysql');
var db = mysql.createConnection({
	host: '',
	user: '',
	password: '',
	database: '',
	port: '',
});
db.connect();

module.exports = db;
