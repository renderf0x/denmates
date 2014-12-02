var app = angular.module( 'denMatesClient', [ 'ngMaterial', 'ngQuickDate', 'ui.router' ] )
	.config(function($stateProvider, $urlRouterProvider){
		$urlRouterProvider.otherwise('/');
		$stateProvider
			.state('home', {
				url: "/",
				controller: "foobar",
				templateUrl: "app/views/denView.html"
			})
			.state('denById', {
				url: '/den/:denid',
				controller: 'foobar',
				templateUrl: 'app/views/denView.html'
			});
		});
app.config(function(ngQuickDateDefaultsProvider) {
  // Configure with icons from font-awesome
  return ngQuickDateDefaultsProvider.set({
    closeButtonHtml: "<i class='fa fa-times'></i>",
    buttonIconHtml: "<i class='fa fa-clock-o'></i>",
    nextLinkHtml: "<i class='fa fa-chevron-right'></i>",
    prevLinkHtml: "<i class='fa fa-chevron-left'></i>",
    // Take advantage of Sugar.js date parsing
    parseDateFunction: function(str) {
      d = Date.create(str);
      return d.isValid() ? d : null;
    }
  });
});

app.controller('foobar', function($scope, expensesFactory){

    	$scope.data = {};
    	$scope.data.newExpense = {};
    	$scope.data.newExpense.date = new Date();
    	$scope.data.users = ['Horo', 'Lawrence', 'Chloe']; //for testing
    	$scope.data.den = 'den1';

    	$scope.getExpensesForDen = function(den){
    		expensesFactory.getExpensesForDen(den).then(function(data){
    			$scope.data.expenses = data
    			});
    	};

    	$scope.saveNewExpense = function(){
    		console.log($scope.data.newExpense);
    		expensesFactory.saveNewExpense($scope.data.newExpense, $scope.data.den);
    	};

    	$scope.getExpensesForDen('den1');
});

app.factory('expensesFactory', function($q, $http){
    	var getExpenses = function(){
    		console.log("expenses!")
    	}

    	var getExpensesForDen = function(den){
    		return $http({
    			method: 'GET',
    			url: '/api/dens/' + den,
    		}).then(function(res){
    			return res.data;
    		});
    	};


    	var saveNewExpense = function (data, den){
    		var preparedData = prepareData(data);
    		console.log(preparedData);
    		return $http({
    			method: 'POST',
    			url: '/api/dens/' + den,
    			data: preparedData
    		}).then(function(res){
    			return res.data;
    		});
    	};

    	var prepareData = function(data){
    		return {
    			date: data.date,
    			title: data.title,
    			amount: parseInt(data.amount, 10),
    			description: data.description,
    			user: data.user,
    			tags: data.tags.split(" ")
    		};
    	};

    	return {
    		getExpenses: getExpenses,
    		getExpensesForDen: getExpensesForDen,
    		saveNewExpense: saveNewExpense
    	};
});