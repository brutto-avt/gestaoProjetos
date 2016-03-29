angular.module('app').controller('EstimativasCtr', function($scope, $rootScope, $http, $state, $stateParams) {
  $http.get('./api/atividades').then(function(atividades) {
    $scope.atividades = atividades.data;
  });

  if (!$stateParams.estimativaId) {
    $http.get('./api/itens/' + $stateParams.itemId + '/atividades').then(function(estimativas) {
      $scope.estimativas = estimativas.data;
      delete $scope.registro;
    });
  } else {
    if ($stateParams.estimativaId !== 'novo') {
      $http.get('./api/itens/' + $stateParams.itemId + '/atividades/' + $stateParams. estimativaId).then(function(estimativa) {
        $scope.registro = estimativa.data;
        $scope.registro.atividade = $scope.registro.atividade._id;
      });
    } else {
      $scope.registro = {
        projeto: $stateParams.projetoId,
        item: $stateParams.itemId
      };
    }
  }

  $scope.detalhe = function(estimativa) {
    $state.go('.detalhe', {
      'estimativaId': estimativa._id
    });
  };

  $scope.gravar = function () {
    var metodo = 'post';

    if ($stateParams.estimativaId !== 'novo') {
      metodo = 'put';
    }

    $http[metodo]('./api/itens/' + $stateParams.itemId + '/atividades', $scope.registro).then(function (registro) {
      $scope.voltar();
    });
  };

  $scope.excluir = function () {
    $http.delete('./api/itens/' + $stateParams.itemId + '/atividades/' + $stateParams.estimativaId).then(function () {
      $scope.voltar();
    });
  };

  $scope.voltar = function () {
    $state.go('projetos.detalhe.item.estimativas', {
      'projetoId': $stateParams.projetoId,
      'itemId': $stateParams.itemId
    });
  };
});
