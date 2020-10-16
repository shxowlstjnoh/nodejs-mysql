// 버전관리를 하지 않음(비밀번호)

var mysql = require('mysql');
var db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '111111',
	database: 'opentutorials',
	port: '3307',
});
db.connect();

module.exports = db;
