var app = angular.module('myapp', ['ngRoute']);

// ............................. Routes ............................//

app.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'views/login.html',
      controller: 'loginController'
    })
    .when('/home', {
      templateUrl: 'views/home.html',
      controller: 'homeController',
      resolve: ['AuthService', function (AuthService) {
        return AuthService.checkStatus();
      }]
    })
    .when('/users', {
      templateUrl: 'views/users.html',
      controller: 'usersController',
      resolve: ['AuthService', function (AuthService) {
        return AuthService.checkStatus();
      }]
    })
    .when('/users-list', {
      templateUrl: 'views/usersList.html',
      controller: 'usersListController',
      resolve: ['AuthService', function (AuthService) {
        return AuthService.checkStatus();
      }]
    })
    .otherwise({
      redirectTo: '/'
    });
});

// ............................. Services ............................//

app.factory('LoginService', function () {
  var admin = 'admin';
  var pass = 'admin';

  if (!localStorage.isLoggedIn) {
    localStorage.isLoggedIn = false;
  }

  return {
    login: function (username, password) {
      localStorage.isLoggedIn = (username === admin && password === pass);
      console.log("LS : " + localStorage.isLoggedIn);
      return localStorage.isLoggedIn;
    },
    isAuthenticated: function () {
      console.log("isAuth: " + localStorage.isLoggedIn);
      return localStorage.isLoggedIn;
    },
    logout: function () {
      localStorage.isLoggedIn = false;
      return true;
    }
  };

});

app.factory('AuthService', function ($location, $q, LoginService, $rootScope) {
  return {
    'checkStatus': function () {
      var defer = $q.defer();
      if (JSON.parse(LoginService.isAuthenticated())) {
        $rootScope.navStatus = JSON.parse(LoginService.isAuthenticated());
        defer.resolve();
      } else {
        defer.reject();
        $location.path('/');
      }
      return defer.promise;
    }
  };
});

app.factory('DataService', function() {
  if(!localStorage.userDetails) {
    localStorage.userDetails = JSON.stringify([]);
  }

  return {
    saveUserDetails: function(details) {
      var data = this.getUsersDetails();
      data.push(details);
      localStorage.userDetails = JSON.stringify(data);
      return true;
    },
    getUsersDetails: function() {
      return JSON.parse(localStorage.userDetails);
    },
    deleteUserData: function(user_id) {
      var data = this.getUsersDetails();
      data.splice(user_id, 1);
      localStorage.userDetails = JSON.stringify(data);
      return true;
    }
  };
});

// ............................. Controllers ............................//

app.controller('indexController', function($scope, $location, LoginService, $rootScope) {
  $scope.logout = function () {
    if(LoginService.logout()) {
      $rootScope.navStatus = JSON.parse(LoginService.isAuthenticated());
      $location.path('/');
    }
  };
});

app.controller('loginController', function ($scope, $location, LoginService) {
  //Precheck if logged in
  if (JSON.parse(LoginService.isAuthenticated())) {
    $location.url("/home");
  }

  // Not logged in, create local storage entry.
  $scope.welcomeMessage = "Login Page";
  $scope.login = function () {
    if (($scope.auth.username && $scope.auth.username) == '' ||
        ($scope.auth.password && $scope.auth.password == '')) {
      return false;
    }
    // hardcoded admin
    if (JSON.parse(LoginService.login($scope.auth.username, $scope.auth.password))) {
      $location.path("/home");
    } else {
      $location.path("/");
    }
  };
});

app.controller('homeController', function ($scope) {
  $scope.welcomeMessage = "Welcome page";
});

app.controller('usersController', function ($scope, DataService, $location) {
  $scope.welcomeMessage = "Create New User";
  $scope.saveDetails = function() {
    if (DataService.saveUserDetails($scope.auth)) {
      $location.path("/users-list");
    }
  };
});

app.controller('usersListController', function ($scope, DataService, $location) {
  $scope.welcomeMessage = "Users Listing";
  $scope.users = DataService.getUsersDetails();
  $scope.deleteUser = function (user_id) {
    if (DataService.deleteUserData(user_id)){
      $scope.users.splice(user_id, 1);
    }
  };
});