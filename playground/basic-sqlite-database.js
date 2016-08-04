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
var User = sequelize.define('user', {
	email: Sequelize.STRING
});

QA.belongsTo(User);
User.hasMany(QA);

sequelize.sync({
	//force: true 
}).then(function () {
	console.log('Everything is synced');


	User.create({
		email: 'kmur15@gmail.com'
	}).then(function () {
		return QA.create({
			question: "what is the capital of Bangladesh?",
			answer: "Dakar",
			known: true
		});
	}).then(function (qa) {
		User.findById(1).then(function (user) {
			//user.addQa(qa); //you actually need use the instance variable here but capitalize the first letter after add so "Qa" in this case.""
			user.getQas({
				where: {
					known: false
				}
			}).then(function (qas) {
				qas.forEach(function (qa) {
					console.log(qa.toJSON());
				});
			});
		});
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

