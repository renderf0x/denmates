angular.module( 'denMatesClient' )
  .controller('landingController', function($scope) {
      //empty for now
  })

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
  });

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

    $scope.data.scores = temp;
  }

  $scope.saveNewExpense = function(){
    expensesFactory.saveNewExpense($scope.data.newExpense, $scope.data.den)
      .then(function(){
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

  $scope.showManageDens = function(event){
    $mdDialog.show({
      controller: DialogController,
      templateUrl: "app/views/dialogs/manageDens.html",
      targetEvent: event
    });
  };

    $scope.deleteExpense = function(expenseID){
      expensesFactory.deleteExpense(expenseID);
      $scope.getExpensesForDen($scope.data.den);
    };
});
