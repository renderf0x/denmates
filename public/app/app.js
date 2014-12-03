var app = angular.module( 'denMatesClient', [ 'ngMaterial', 'ngQuickDate', 'ui.router', 'd3' ] )
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

app.controller('mainExpensesController', function($scope, $mdDialog, $stateParams, $window, expensesFactory, denFactory){

    	$scope.data = {};
    	$scope.data.newExpense = {};
    	$scope.data.newExpense.date = new Date();
    	$scope.data.den = $stateParams.denId || 'den1';
        denFactory.getUsersForDen($scope.data.den).then(function(data){
            $scope.data.users = data
            console.log("got users: ", data)
        });

        $scope.data.scores = [
              {name: "horo", score: 98},
              {name: "lawrence", score: 96},
              {name: 'chloe', score: 75},
              {name: "test", score: 48},
              {name: "derek", score: 55}
            ];

        // $scope.data.users = ['Horo', 'Lawrence', 'Chloe']; //for testing

    	$scope.getExpensesForDen = function(den){
    		expensesFactory.getExpensesForDen(den).then(function(data){
    			$scope.data.expenses = data
    			}).then(function(){
                    //$scope.getUserScores();
                });
    	};

        $scope.getUserScores = function(){
            var temp = {};
            // console.dir($scope.data.expenses);
            for (var i = 0; i < $scope.data.expenses.length; i++){
                if (!temp.hasOwnProperty($scope.data.expenses[i].user)){
                    temp[$scope.data.expenses[i].user] = 0;
                }
                temp[$scope.data.expenses[i].user] += $scope.data.expenses[i].amount;            }
            console.log("setting scores to ", temp);
            $scope.data.scores = temp;
        }

    	$scope.saveNewExpense = function(){
    		console.log($scope.data.newExpense);
    		expensesFactory.saveNewExpense($scope.data.newExpense, $scope.data.den).then(function(){
                $scope.getExpensesForDen($scope.data.den);
            });
    	};

    	$scope.showCreateDen = function(event){
    		$mdDialog.show({
    			controller: DialogController,
    			templateUrl: "app/views/dialogs/createDenDialog.html",
    			targetEvent: event
    		}).then(function(data){
                console.log("Got this data: ", data);
            });
    	};

    	$scope.showAddMatesToDen = function(event){
    		$mdDialog.show({
    			controller: DialogController,
    			templateUrl: "app/views/dialogs/addMatesToDenDialog.html",
    			targetEvent: event
    		});
    	};

        $scope.deleteExpense = function(expenseID){
            expensesFactory.deleteExpense(expenseID);
            $scope.getExpensesForDen($scope.data.den);
        };

    	$scope.getExpensesForDen($scope.data.den);
    	console.log($stateParams);
        $window.CreateChart();
});

function DialogController($scope, $mdDialog, $stateParams, $state, denFactory, userFactory){
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
	  	denFactory.saveNewDen(den).then(function(){
            $state.go('denById', {denId: den});
        });
	    $mdDialog.hide();
        return den;
	  };

      $scope.addMatesToDen = function(){
        console.log("Current Selection: ", $scope.selectedMates);
        denFactory.addUsersToDen($scope.data.den, $scope.selectedMates);
        $mdDialog.hide();
      };
};

app.factory('denFactory', function($q, $http, $location){
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

        var deleteExpense = function(expenseID){
            return $http({
                method: 'DELETE',
                url: '/api/expenses/' + expenseID
            }).then(function(res){
                return res.data;
            });
        };

    	return {
    		getExpenses: getExpenses,
    		getExpensesForDen: getExpensesForDen,
    		saveNewExpense: saveNewExpense,
            deleteExpense: deleteExpense
    	};
});

app.filter("customCurrency", function (numberFilter)
  {
    function isNumeric(value)
    {
      return (!isNaN(parseFloat(value)) && isFinite(value));
    }
    return function (inputNumber) {
        if (isNumeric(inputNumber)){

            var cents = inputNumber.toString().slice(-2);
            var dollars = inputNumber.toString().slice(0,-2);
            return dollars + '.' + cents;
        }
        else {
            return inputNumber;
        }
    };
});

angular.module('d3', [])
  .factory('d3Service', ['$document', '$q', '$rootScope',
    function($document, $q, $rootScope) {
      var d = $q.defer();
      function onScriptLoad() {
        // Load client in the browser
        $rootScope.$apply(function() { d.resolve(window.d3); });
      }
      // Create a script tag with d3 as the source
      // and call our onScriptLoad callback when it
      // has been loaded
      var scriptTag = $document[0].createElement('script');
      scriptTag.type = 'text/javascript'; 
      scriptTag.async = true;
      scriptTag.src = 'http://d3js.org/d3.v3.min.js';
      scriptTag.onreadystatechange = function () {
        if (this.readyState == 'complete') onScriptLoad();
      }
      scriptTag.onload = onScriptLoad;

      var s = $document[0].getElementsByTagName('body')[0];
      s.appendChild(scriptTag);

      return {
        d3: function() { return d.promise; }
      };
}]);

app.directive('barChart', ['d3Service', function(d3Service){
    return {
        restrict: 'EA'
    };
}])
    .directive('d3Bars', ['d3Service', function(d3Service, $window, $timeout){
        return {
            restrict: 'EA',
            scope: {
                data: '='
            },
            link: function(scope, element, attrs){
                d3Service.d3().then(function(d3){

                    var margin = parseInt(attrs.margin) || 20,
                        barHeight = parseInt(attrs.barHeight) || 20,
                        barPadding = parseInt(attrs.barPadding) || 5;

                    var svg = d3.select(element[0])
                        .append("svg")
                        .style('width', '100%');

                        window.onresize = function(){
                            scope.$apply();
                        };

                        // scope.$watch(function(){
                        //     return angular.element($window)[0].innerWidth;
                        // }, function(){
                        //     scope.render(scope.data);
                        // });

                        scope.$watch('data', function(newVals, oldVals){
                            return scope.render(newVals);
                        }, true);

                        scope.render = function(data) {
                            console.log("scope render run");
                            svg.selectAll('*').remove();
                            if (!data) return;

                            var height = scope.data.length * (barHeight + barPadding);
                            
                            var width = d3.select(element[0]).node().offsetWidth - margin, color = d3.scale.category20(),
                                 xScale = d3.scale.linear().domain([0, d3.max(data, function(d){
                                        return d.score;
                                 })])
                                 .range([0, width]);
                            svg.attr('height', height);

                            svg.selectAll('rect')
                                .data(data).enter()
                                .append('rect')
                                .attr('height', barHeight)
                                .attr('width', 140)
                                .attr('x', Math.round(margin/2))
                                .attr('y', function(d,i) {
                                  return i * (barHeight + barPadding);
                                })
                                .attr('fill', function(d) { return color(d.score); })
                                .transition()
                                    .duration(1000)
                                    .attr('width',function(d){
                                        return xScale(d.score);
                                    });
                            svg.selectAll('text')
                                  .data(data)
                                  .enter()
                                  .append('text')
                                  .attr('fill', '#fff')
                                  .attr('y', function(d,i) {
                                    return i * (barHeight + barPadding) + 15;
                                  })
                                  .attr('x', 15)
                                  .text(function(d) {
                                    return d.name + " (scored: " + d.score + ")";
                                  });

                        }
                        scope.render(scope.data);
                        setTimeout(function(){
                            scope.render.bind(this, scope.data);
                        }, 3000);
                });
            }
        };
}]);