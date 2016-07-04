var express = require('express');
var app = express();
var db = require('./db.js');
var PORT = process.env.port || 3000;
var bodyParser = require('body-parser');
var _ = require('underscore');
var QAS = [];
var QASNextId = 1;




app.use(bodyParser.json());

app.get('/' , function (req,res) {
    res.sendfile('public/index.html');
});

app.get('/allQA', function (req, res) {
	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('known') && query.known === 'true') {
		where.known = true;
	} else if (query.hasOwnProperty('known') && query.known === 'false') {
		where.known = false;
	}

	if (query.hasOwnProperty('q') && query.q.length > 0) {
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

app.get('/QA/:id', function (req, res) {
	var qaID = parseInt(req.params.id, 10);
	db.qa.findById(qaID).then(function(qa) {
		if (qa) {
			res.json(qa.toJSON());
		} else {
			res.status(404).send();
		}
	}, function (e) {
		res.status(500).send();
	});
});

app.post('/addQA', function (req, res) {
	var body = _.pick(req.body, 'question', 'answer', 'known');

	db.qa.create(body).then(function (qa) {
		res.status(200).json(qa.toJSON())
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

app.put('/todos/:id', function (req, res) {
	var body = _.pick(req.body, 'question', 'answer', 'known');
	var validAttributes = {};
	var QAId = parseInt(req.params.id, 10);
	var matchedQA = _.findWhere(QAS, {id: QAId});

	if (!matchedQA) {
		res.status(404).send();
	}

	if (body.hasOwnProperty('known') && _.isBoolean(body.known)) {
		validAttributes.known = body.known;
	} else if (body.hasOwnProperty('known')) {
		res.status(400).send();
	} 

	if (body.hasOwnProperty('question') && _.isString(body.question) && body.question.trim().length>0) {
		validAttributes.question = body.question;
	} else if (body.hasOwnProperty('question')) {
		res.status(400).send();
	} 

	if (body.hasOwnProperty('answer') && _.isString(body.answer) && body.answer.trim().length>0) {
		validAttributes.answer = body.answer;
	} else if (body.hasOwnProperty('answer')) {
		res.status(400).send();
	} 

	_.extend(matchedQA, validAttributes);

	res.json(matchedQA);
});

db.sequelize.sync().then(function () {
	app.listen(PORT, function() {
		console.log('Jeopardy Server up and running');
	});
});