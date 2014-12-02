var express = require("express");
var router = express.Router();
var Expense = require('./models/expense.js');

//for testing only


router.get('/', function(req, res){
	res.send("hello");
});

router.get('/dens/real', function(req, res){
	Expense.find({}, function(err, expenses){
		if (err)
			res.send(err);
		res.json(expenses);
	});
})

router.route('/dens/:den')
	.get(function(req, res){

		Expense.find({den: req.params.den}, function(err, expenses){
			if (err)
				res.send(err);
			res.json(expenses);
		});
	})	
	.post(function(req, res){

		var expense = new Expense();
		expense.date = req.body.date;
		expense.title = req.body.title;
		expense.amount = req.body.amount;
		expense.description = req.body.description;
		expense.user = req.body.user;
		expense.tags = req.body.tags;
		expense.den = req.params.den;

		expense.save(function(err){
			if (err)
				res.send(err);
			res.status(201).end();
		});

	});

router.route('/users/:den')
	.get(function(req, res){

	})
	.post(function(req, res){

	});

router.route('/dens')
	.get(function(req, res){

	})
	.post(function(req, res){

	});

router.route('/mates')
	.get(function(req, res){

	})
	.post(function(req, res){

	});

module.exports = router;