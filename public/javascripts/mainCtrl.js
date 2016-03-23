angular.module('app').controller('MainCtrl', function($scope, $rootScope, $timeout, $cookies, $http, $state) {
  if ($cookies.get('usuario')) {
    $scope.usuario = $cookies.get('usuario');
    $scope.perfil = $cookies.get('perfil');
  }

  $scope.formLogin = {};

  $scope.autenticar = function() {
    $http.post('./api/usuarios/autenticar', $scope.formLogin)
    .then(function(usuario) {
      $scope.usuario = usuario.data;
      $state.go('inicio');
    }, function (erro) {
      console.log(erro);
    });
  };

  $scope.sair = function () {
    delete $scope.usuario;
    delete $scope.perfil;
    $cookies.remove('usuario');
    $cookies.remove('perfil');
    $state.go('login');
  };

  $rootScope.$on('$stateChangeStart', function(evt, toState, toParams, fromState, fromParams) {
    if (toState.name === 'login' && $scope.usuario) {
      evt.preventDefault();
      $state.go('inicio');
    }
    if (toState.name !== 'login' && !$scope.usuario) {
      evt.preventDefault();
      $state.go('login');
    }
  });
});
