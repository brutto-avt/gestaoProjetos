angular.module('app').controller('AtividadesCtr', function($scope, $rootScope, $http, $state, $stateParams) {
  if (!$stateParams.atividadeId) {
    $http.get('./api/atividades').then(function(atividades) {
      $scope.atividades = atividades.data;
      delete $scope.registro;
    });
  } else {
    if ($stateParams.atividadeId !== 'novo') {
      $http.get('./api/atividades/' + $stateParams.atividadeId).then(function(atividade) {
        $scope.registro = atividade.data;
      });
    } else {
      $scope.registro = {};
    }
  }

  $scope.detalhe = function(atividade) {
    $state.go('atividades.detalhe', {
      'atividadeId': atividade._id
    });
  };

  $scope.gravar = function () {
    var metodo = 'post';

    if ($stateParams.atividadeId !== 'novo') {
      metodo = 'put';
    }

    $http[metodo]('./api/atividades', $scope.registro).then(function (registro) {
      $scope.voltar();
    });
  };

  $scope.excluir = function () {
    $http.delete('./api/atividades/' + $stateParams.atividadeId).then(function () {
      $scope.voltar();
    });
  };

  $scope.voltar = function () {
    $state.go('atividades');
  };
});
