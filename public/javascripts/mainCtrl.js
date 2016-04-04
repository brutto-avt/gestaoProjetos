angular.module('app').controller('MainCtrl', function($scope, $rootScope, $timeout, $cookies, $http, $state) {
  if ($cookies.get('usuario')) {
    $scope.usuario = $cookies.get('usuario');
    $scope.perfil = $cookies.get('perfil');
  }

  $scope.formLogin = {};
  $scope.equipe = [];

  $scope.autenticar = function() {
    $http.post('./api/usuarios/autenticar', $scope.formLogin)
    .then(function(usuario) {
      $scope.usuario = usuario.data;
      $scope.perfil = $cookies.get('perfil');
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

  $scope.getSituacao = function(situacao) {
    switch (situacao) {
      case 'N':
        return 'Normal';
        break;
      case 'A':
        return 'Atrasado';
        break;
      case 'R':
        return 'Em risco';
        break;
    }
  };

  $scope.getClasse = function (situacao) {
    switch (situacao) {
      case 'N':
        return 'bg-success';
        break;
      case 'A':
        return 'bg-danger';
        break;
      case 'R':
        return 'bg-warning';
        break;
    }
  };

  $scope.getCorPerc = function (perc) {
    if (perc >= 75) {
      return '#35BD14';
    } else if (perc >= 50) {
      return '#9EC524';
    } else {
      return '#CA480A';
    }
  };

  $scope.buscarEstatisticas = function () {
    if (!$cookies.get('usuario')) return;

    $http.get('./api/estatisticas/' + $cookies.get('usuario')).then(function (estatisticas) {
      estatisticas = estatisticas.data;

      estatisticas.forEach(function (projeto) {
        Object.keys(projeto.equipe).forEach(function (membro) {
          $http.get('./api/usuarios/' + membro).then(function(dadosMembro) {
            $scope.equipe.push({
              horas: projeto.equipe[membro],
              nome: dadosMembro.data.nome
            });
          });
        });
      });

      $scope.estatisticas = estatisticas;
    });
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
    if (toState.name === 'inicio') {
      $scope.buscarEstatisticas();
    }
  });
});
