var express = require('express');
var app = express();
var db = require('./db.js');
var PORT = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var _ = require('underscore');
var middleware = require('./middleware.js')(db);
var bcrypt = require('bcryptjs');
var QAS = [];
var QASNextId = 1;




app.use(bodyParser.json());

app.get('/' , function (req,res) {
    res.sendfile('public/index.html');
});

app.get('/allQA', middleware.requireAuthentication, function (req, res) {
	var query = req.query;
	var where = {
		userId: req.user.get('id')
	};

	if (query.hasOwnProperty('known') && query.known === 'true') {
		where.known = true;
	} else if (query.hasOwnProperty('known') && query.known === 'false') {
		where.known = false;
	}

		console.log('In the allQA API');

	if (query.hasOwnProperty('q') && query.q.length > 0) {
		console.log('In the allQA API q If statement');
		//if this code is being applied to a SQLite browser
		//then it appears to be case insensitive, but
		//when used for postgres there appear to be case
		//sensitive searches
		where.question = {
			$like: '%' + query.q + '%'
		};
	}

	if (query.hasOwnProperty('a') && query.a.length > 0) {
		where.answer = {
			$like: '%' + query.a + '%'
		};
	}

	db.qa.findAll({where: where}).then(function (qas) {
		res.json(qas);
	}, function (e) {
		res.status(500).send();
	})
});

app.get('/QA/:id', middleware.requireAuthentication, function (req, res) {
	var qaId = parseInt(req.params.id, 10);
	
	db.qa.findOne({
		where: {
			id: qaId,
			userId: req.user.get('id')
		}
	}).then(function(qa) {
		if (qa) {
			res.json(qa.toJSON());
		} else {
			res.status(404).send();
		}
	}, function (e) {
		res.status(500).send();
	});
});


app.post('/addQA', middleware.requireAuthentication, function (req, res) {
	var body = _.pick(req.body, 'question', 'answer', 'known');

	db.qa.create(body).then(function (qa) {
		
		req.user.addQa(qa).then(function () {
			return qa.reload();
		}).then(function (qa) {
			res.json(qa.toJSON());
		});
	}, function (e) {
		res.status(404).json(e);
	});

	// if (!_.isString(body.question) || !_.isString(body.answer) || !_.isBoolean(body.known) || body.question.trim().length===0 || body.answer.trim().length===0) {
	// 	return res.status(400).send();
	// }

	// body.question = body.question.trim();
	// body.answer = body.answer.trim();

	// body.id = QASNextId;
	// QAS.push(body);
	// QASNextId++;
	// res.json(body);
});    

app.put('/QA/:id', middleware.requireAuthentication, function (req, res) {
	var body = _.pick(req.body, 'question', 'answer', 'known');
	var validAttributes = {};
	var qaId = parseInt(req.params.id, 10);
	

	if (body.hasOwnProperty('known')) {
		validAttributes.known = body.known;
	} 

	if (body.hasOwnProperty('question')) {
		validAttributes.question = body.question;
	} 

	if (body.hasOwnProperty('answer')) {
		validAttributes.answer = body.answer;
	} 

	db.qa.findOne({
		where: {
			id: qaId,
			userId: req.user.get('id')
		}
	}).then(function (qa) {
		if(qa) {
			qa.update(validAttributes).then(function(qa) {
				res.json(qa.toJSON());
			}, function (e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).send();
		}		
	}, function () {
		res.status(500).send();
	});
});

app.delete('/QA/:id', middleware.requireAuthentication, function (req, res) {
	var qaId = parseInt(req.params.id, 10);

	db.qa.destroy({
		where: {
			id: qaId,
			userId: req.user.get('id')
		}
	}).then(function (rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				error: "No QA found with that id"
			});
		} else {
			res.status(204).send();
		}
	}, function() {
		res.status(500).send();
	});
});

app.post('/users', function (req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function (user) {
		res.status(200).json(user.toPublicJSON())
	}, function (e) {
		res.status(404).json(e);
	});
});

app.post('/users/login', function (req, res) {
	var body = _.pick(req.body, 'email', 'password');



	db.user.authenticate(body).then(function (user) {
		var token = user.generateToken('authentication');

		if (token) {	
			res.header('Auth', token).json(user.toPublicJSON());
		} else {
			res.status(401).send();
		}
	}, function () {
		res.status(401).send();
	});
});

db.sequelize.sync({force: true}).then(function () {
	app.listen(PORT, function() {
		console.log(PORT);
		console.log('Jeopardy Server up and running');
	});
});