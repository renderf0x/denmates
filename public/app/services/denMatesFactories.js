angular.module( 'denMatesClient' )
.factory('denFactory', function($q, $http, $location){
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

  getDens = function(){
    return $http({
      method: 'GET',
      url: '/api/dens/'
    }).then(function(res){
      return res.data;
    });
  };

  return {
    saveNewDen: saveNewDen,
    addUsersToDen: addUsersToDen,
    getUsersForDen: getUsersForDen,
    getDens: getDens
  };
})

.factory('userFactory', function($q, $http){
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
})

.factory('expensesFactory', function($q, $http){
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
