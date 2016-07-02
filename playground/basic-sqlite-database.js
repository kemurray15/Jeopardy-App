//Step 1 instantiate the database

var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-database.sqlite'
});


//step 2 define the data model

var QA = sequelize.define('qa', {
	question: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			len: [1, 250]
		}
	},
	answer: {
		type: Sequelize.STRING,
		allowNull: false
	},
	known: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	},
});

//step 3 enter data

sequelize.sync({
	force: true //I think if you force this sync then it's possible that when this program runs it would delete all existing data in the sqlitebrowser database? Yes, something about the force 
	//deletes the existing data.  So by not forcing the below search will work because it will allow the existing data in the database to persist.
}).then(function () {
	console.log('Everything is synced');
	
	QA.findById(1).then(function (qa) {
		if (qa) {
			console.log(qa.toJSON());
		} else {
			console.log('No QA found!');
		}
	});

	// QA.create({
	// 	question: 'Who are the founders of Google?',
	// 	answer: 'Larry Page & Sergey Brin',
	// 	knwon: true
	// }).then(function (qa) {
	// 	return QA.create({
	// 		question: 'What is the capital city of New Zealand?',
	// 		answer: 'Wellington'
	// 	});
	// }).then(function() {
	// 	return QA.findAll({
	// 		where: {
	// 			question: {
	// 				$like: '%capital%' //not case sensitive
	// 			}
	// 		}
	// 	});
	// }).then(function (QAs) {
	// 	//The QAs input to this function is what was returned from the previous promise (if that is a promise) - so we're just logging out whatever the previous search found
	// 	if (QAs) {
	// 		QAs.forEach(function(QA){
	// 			//console.log(QA.toJSON());
	// 		});	
	// 	} else {
	// 		console.log('no QA found!');
	// 	}
	// }).catch(function (e) {
	// 	console.log("*******************" + e);
	// });
});

