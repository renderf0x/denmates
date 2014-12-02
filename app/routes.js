var express = require("express");
var router = express.Router();
var Expense = require('./models/expense.js');
var Den = require('./models/den.js');
var User = require('./models/user.js');

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

//should display users in a den, and add users to a den
router.route('/users/dens/:den')
	.get(function(req, res){
		Den.find({name: req.params.den}, function(err, data){
			if (err)
				res.send(err);
			else if (data.length > 0){
				var usersArray = data[0].users;
				User.find({'_id': { $in: usersArray}}, function(err, data){
					if (err)
						res.send(err);
					res.json(data);
				}); 
			} else {
				res.json({});
			}
		});
	})
	.post(function(req, res){
		console.log(req.body);
		Den.findOne({name: req.params.den}, function(err, den){
			if (err)
				res.send(err);
			if (!den){
				res.status(500).end();
			} else {
				
				for (var i = 0; i < req.body.users.length; i++){
					if (den.users.indexOf(req.body.users[i]) === -1){
						den.users.push(req.body.users[i]);
					}
				}
				den.save(function(err){
					if (err)
						res.send(err);
					res.status(201).end();
				});
			}
		});
	});

router.route('/dens')
	.get(function(req, res){
		Den.find({}, function(err, data){
			if (err)
				res.send(err);
			res.json(data);
		});
	})
	.post(function(req, res){
		console.log(req.body.den);

		Den.find({name: req.body.den}, function(err, data){
			if (err){
				res.send(err);
			}
			else if (data.length >=1){
				console.log('found status', data);
				res.send('found')
			} else {
				var den = new Den({
					name: req.body.den
				});
				den.save(function(err){
					if (err)
						res.send(err);
					res.status(201).end();
					});
			}
		});

	});

router.route('/mates')
	.get(function(req, res){
		//fake data
		var data = {mates: [{id: '45dhfks', name:'Horo'}, {id:'h4r8f',name:'Lawrence'}, {id:'477gds',name:'Chloe'}, {id:'dge54',name:'Renard'}, {id:'eh45sw',name:'Inari'}]}

		User.find({}, function(err, data){
			if (err)
				res.send(err);
			res.json({mates: data});
		});

		// res.json(data);
	})
	.post(function(req, res){

	});

//testing route to manually add users

router.route('/users')
	.get(function(req, res){
		User.find({}, function(err, data){
			if (err)
				res.send(err);
			res.send(data);
		})
	})
	.post(function(req, res){
		console.log("add user", req.body);
		var user = new User({
			name: req.body.name,
			dens: [],
			local: {
					email: req.body.email,
					password: req.body.password
				}
		});

		user.save(function(err){
			if (err)
				res.send(err);
			res.send("created");
		});
	});

module.exports = router;