var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/data/dev-JeopardyApp.sqlite'
});

var db = {};

db.qa = sequelize.import(__dirname + '/models/qa.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;