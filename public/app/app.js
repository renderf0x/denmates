var app = angular.module( 'denMatesClient', [ 'ngMaterial', 'ngQuickDate', 'ui.router', 'd3' ] )
	.config(function($stateProvider, $urlRouterProvider){
		$urlRouterProvider.otherwise('/');
		$stateProvider
      .state('landing', {
        url: '/',
        controller: 'landingController',
        templateUrl: 'app/views/landing.html'
      })
			.state('home', {
				url: '/home',
				controller: 'mainExpensesController',
				templateUrl: 'app/views/denView.html'
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
                        .append('svg')
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
                                    return d.name + ' (total: ' + d.score + ')';
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
        console.log('Current Selection: ', $scope.selectedMates);
        denFactory.addUsersToDen($scope.data.den, $scope.selectedMates);
        $mdDialog.hide();
      };
};
