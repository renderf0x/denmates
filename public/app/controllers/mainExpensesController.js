angular.module( 'denMatesClient' )
    .controller('mainExpensesController', function($scope, $mdDialog, $stateParams, $window, expensesFactory, denFactory){

    	$scope.data = {};
    	$scope.data.newExpense = {};
    	$scope.data.newExpense.date = new Date();
    	$scope.data.den = $stateParams.denId || 'den1';

        denFactory.getUsersForDen($scope.data.den)
          .then(function(data){
            $scope.data.users = data
            console.log("got users: ", data)
        }).then(function(){
            return expensesFactory.getExpensesForDen($scope.data.den);
        }).then(function(data){
            $scope.data.expenses = data;
            $scope.getUserScores();
            // $scope.nugraph();
            // $scope.graph3($scope.data.scores);
        });

        // $scope.data.scores = [
        //       {name: "horo", score: 98},
        //       {name: "lawrence", score: 96},
        //       {name: 'chloe', score: 75},
        //       {name: "test", score: 48},
        //       {name: "derek", score: 55}
        //     ];

        // $scope.data.users = ['Horo', 'Lawrence', 'Chloe']; //for testing

    	$scope.getExpensesForDen = function(den){
    		expensesFactory.getExpensesForDen(den).then(function(data){
    			$scope.data.expenses = data
    			}).then(function(){
                    $scope.getUserScores();
                });
    	};

        $scope.getUserScores = function(){


            var temp = [];

            for (var i = 0; i < $scope.data.expenses.length; i++){
                var userIdx = null;
                for (var j = 0; j < temp.length; j++){
                    if (temp[j].name === $scope.data.expenses[i].user){
                        userIdx = j;
                    }
                }

                if (userIdx !== null) {
                    temp[userIdx].score += $scope.data.expenses[i].amount;
                } else {
                    temp.push({
                        name: $scope.data.expenses[i].user,
                        score: $scope.data.expenses[i].amount
                    });
                }
            }

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

        // $scope.graph3 = function(scores) {
        //     var graph = d3.select('.nugraph');
        //     var width = 500;
        //     var color = d3.scale.category20();
        //     var scale = d3.scale.linear()
        //                         .domain([0, d3.max(scores, function(d){
        //                               return d.score;
        //                         })])
        //                         .range([0, width]);

        //     graph.selectAll('div')
        //          .data(scores).enter()
        //          .append('div')
        //          .attr('class', 'den-graph-bar')
        //          .style('width', '0')
        //          .style('height', '20px')
        //          .style('background-color', function(d){
        //             return color(d.score);
        //          })
        //          .style('color', '#fff')
        //          .text(function(d){
        //             return d.name + '(' + d.score + ')';
        //          })
        //          .transition()
        //             .duration(1000)
        //             .style('width', function(d){
        //                 return scale(d.score) + 'px';
        //             })

        // };

        $scope.nugraph = function(){
            var margin = 20;
            var barHeight = 20;
            var barPadding = 5;

            var svg = d3.select('.nugraph')
                .append('svg')
                .style('width', '100%');

            //svg reset and no data check here

            var height = $scope.data.users.length * (barHeight + barPadding);

            var width = d3.select('.nugraph').node().offsetWidth - margin;
            var color = d3.scale.category20();
            var xScale = d3.scale.linear().domain([0, d3.max($scope.data.scores, function(d){return d})]).range([0, width]);

            svg.attr('height', height);

            svg.selectAll('rect')
                .data($scope.data.scores).enter()
                .append('rect')
                .attr('height', barHeight)
                .attr('width', 140)
                .attr('x', Math.round(margin/2))
                .attr('y', function(d,i){
                    return i * (barHeight + barPadding);
                })
                .attr('fill', function(d){
                    return color(d);
                })
                .transition()
                    .duration(1000)
                    .attr('width', function(d){
                        return xScale(d);
                    });

                //TODO assign names / text
        };

    	// $scope.getExpensesForDen($scope.data.den);
    	console.log($stateParams);
});
