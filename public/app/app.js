var app = angular.module( 'denMatesClient', [ 'ngMaterial', 'ngQuickDate', 'ui.router' ] )
	.config(function($stateProvider, $urlRouterProvider){
		$urlRouterProvider.otherwise('/');
		$stateProvider
			.state('home', {
				url: "/",
				controller: "mainExpensesController",
				templateUrl: "app/views/denView.html"
			})
			.state('denById', {
				url: '/dens/:denId',
				controller: 'mainExpensesController',
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

app.controller('mainExpensesController', function($scope, $mdDialog, $stateParams, expensesFactory, denFactory){

    	$scope.data = {};
    	$scope.data.newExpense = {};
    	$scope.data.newExpense.date = new Date();
    	$scope.data.den = $stateParams.denId || 'den1';
        denFactory.getUsersForDen($scope.data.den).then(function(data){
            $scope.data.users = data
            console.log("got users: ", data)
        });

        // $scope.data.users = ['Horo', 'Lawrence', 'Chloe']; //for testing

    	$scope.getExpensesForDen = function(den){
    		expensesFactory.getExpensesForDen(den).then(function(data){
    			$scope.data.expenses = data
    			});
    	};

    	$scope.saveNewExpense = function(){
    		console.log($scope.data.newExpense);
    		expensesFactory.saveNewExpense($scope.data.newExpense, $scope.data.den);
    	};

    	$scope.showCreateDen = function(event){
    		$mdDialog.show({
    			controller: DialogController,
    			templateUrl: "app/views/dialogs/createDenDialog.html",
    			targetEvent: event
    		}).then(function(){});
    	};

    	$scope.showAddMatesToDen = function(event){
    		$mdDialog.show({
    			controller: DialogController,
    			templateUrl: "app/views/dialogs/addMatesToDenDialog.html",
    			targetEvent: event
    		});
    	};

    	$scope.getExpensesForDen($scope.data.den);
    	console.log($stateParams);
});

function DialogController($scope, $mdDialog, $stateParams, denFactory, userFactory){
    $scope.data = $scope.data || {};

    userFactory.getMates().then(function(data){
        $scope.data.mates = data.mates;
    });

    (function(){
        if ($stateParams.denId){
            $scope.data.den = $stateParams.denId || 'den1';
            console.log($scope.data.den);
        }
    })()

    $scope.selectedMates = {};

	 $scope.hide = function() {
	    $mdDialog.hide();
	  };
	  $scope.cancel = function() {
	    $mdDialog.cancel();
	  };
	  $scope.createNewDen = function(den) {
	  	console.log('den is: ' + den);
	  	denFactory.saveNewDen(den);
	    $mdDialog.hide();
	  };

      $scope.addMatesToDen = function(){
        console.log("Current Selection: ", $scope.selectedMates);
        denFactory.addUsersToDen($scope.data.den, $scope.selectedMates);
        $mdDialog.hide();
      };
};

app.factory('denFactory', function($q, $http){
	var saveNewDen = function(den){
		return $http({
			method: 'POST',
			url: '/api/dens',
			data: {den: den}
			}).then(function(res){
				return res.data;
			});
	};

    var addUsersToDen = function(den, userIDs){
        return $http({
            method: 'POST',
            url: '/api/users/dens/' + den,
            data: {users: Object.keys(userIDs)}
            }).then(function(res){
                return res.data;
            });
    };

    var getUsersForDen = function(den){
        return $http({
            method: 'GET',
            url: '/api/users/dens/' + den
        }).then(function(res){
            return res.data;
        });
    };

	return {
		saveNewDen: saveNewDen,
        addUsersToDen: addUsersToDen,
        getUsersForDen: getUsersForDen
	};
});

app.factory('userFactory', function($q, $http){
    var getMates = function(){
        return $http({
            method: 'GET',
            url: '/api/mates'
        }).then(function(res){
            console.log(res.data);
            return res.data;
        });
    };

    return {
        getMates: getMates
    };
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