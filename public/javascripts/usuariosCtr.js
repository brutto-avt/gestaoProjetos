angular.module('app').controller('UsuariosCtr', function($scope, $rootScope, $http, $state, $stateParams) {
  if (!$stateParams.usuarioId) {
    $http.get('./api/usuarios').then(function(usuarios) {
      $scope.usuarios = usuarios.data;
      delete $scope.registro;
    });
  } else {
    if ($stateParams.usuarioId !== 'novo') {
      $http.get('./api/usuarios/' + $stateParams.usuarioId).then(function(usuario) {
        $scope.registro = usuario.data;
        $scope.registro.perfil = $scope.registro.perfil.toString();
      });
    } else {
      $scope.registro = {};
    }
  }

  $scope.getPerfil = function(usuario) {
    switch (usuario.perfil) {
      case 0:
        return 'Membro';
        break;
      case 1:
        return 'Líder';
        break;
      case 2:
        return 'Administrador';
        break;
    }
  };

  $scope.detalhe = function(usuario) {
    $state.go('usuarios.detalhe', {
      'usuarioId': usuario._id
    });
  };

  $scope.gravar = function () {
    var metodo = 'post';

    if ($stateParams.usuarioId !== 'novo') {
      metodo = 'put';
    }

    $scope.registro.perfil = parseInt($scope.registro.perfil);

    $http[metodo]('./api/usuarios', $scope.registro).then(function (registro) {
      $scope.voltar();
    });
  };

  $scope.excluir = function () {
    $http.delete('./api/usuarios/' + $stateParams.usuarioId).then(function () {
      $scope.voltar();
    });
  };

  $scope.voltar = function () {
    $state.go('usuarios');
  };
});
