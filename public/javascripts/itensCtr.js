angular.module('app').controller('ItensCtr', function($scope, $rootScope, $http, $state, $stateParams, $timeout) {
  if (!$stateParams.atividadeId) {
    delete $scope.atualizacao;
  } else {
    $scope.atualizacao = {
      item: $stateParams.itemId,
      atividade: $stateParams.atividadeId
    };
  }

  $http.get('./api/usuarios').then(function(usuarios) {
    $scope.membros = usuarios.data.filter(function(usr) {
      return usr.perfil == 0;
    });
  });

  $http.get('./api/projetos').then(function(projetos) {
    $scope.projetos = projetos.data;
  });

  if (!$stateParams.itemId) {
    $http.get('./api/itens').then(function(itens) {
      $scope.itens = itens.data;
      delete $scope.registro;
    });
  } else {
    if ($stateParams.itemId !== 'novo') {
      $http.get('./api/itens/' + $stateParams.itemId).then(function(item) {
        $scope.registro = item.data;
        $scope.registro.status = $scope.registro.status.toString();
        $scope.registro.prioridade = $scope.registro.prioridade.toString();
        $scope.registro.deadline = new Date($scope.registro.deadline);
        $scope.registro.responsavel = $scope.registro.responsavel._id;
      });

      $http.get('./api/itens/' + $stateParams.itemId + '/atividades').then(function(atividades) {
        $timeout(function(){
          $scope.registro.atividades = atividades.data;
        }, 0);
      });

      $http.get('./api/itens/' + $stateParams.itemId + '/status').then(function(atualizacoes) {
        $timeout(function() {
          $scope.registro.atualizacoes = atualizacoes.data;
        },0);
      });
    } else {
      $scope.registro = {};
    }
  }

  $scope.detalhe = function(item) {
    $state.go('itens.detalhe', {
      'itemId': item._id
    });
  };

  $scope.gravar = function () {
    var metodo = 'post';

    $scope.registro.status = parseInt($scope.registro.status);
    $scope.registro.prioridade = parseInt($scope.registro.prioridade);

    if ($stateParams.itemId !== 'novo') {
      metodo = 'put';
    }

    $http[metodo]('./api/itens', $scope.registro).then(function (registro) {
      $scope.voltar();
    });
  };

  $scope.gravarAtualizacao = function() {
    $http.post('./api/itens/' + $stateParams.itemId + '/status', $scope.atualizacao).then(function() {
      $scope.voltarAtualizacao();
    });
  }

  $scope.excluir = function () {
    $http.delete('./api/itens/' + $stateParams.itemId).then(function () {
      $scope.voltar();
    });
  };

  $scope.voltar = function () {
    $state.go('itens');
  };

  $scope.voltarAtualizacao = function () {
    $state.go('itens.detalhe', {
      itemId: $stateParams.itemId
    });
  };

  $scope.getSituacao = function(item) {
    switch (item.status) {
      case 0:
        return 'Pendente';
        break;
      case 1:
        return 'Em desenvolvimento';
        break;
      case 2:
        return 'Encerrado';
        break;
      case 3:
        return 'Cancelado';
        break;
    }
  };

  $scope.getPrioridade = function(item) {
    switch (item.prioridade) {
      case 0:
        return 'Baixa';
        break;
      case 1:
        return 'Média';
        break;
      case 2:
        return 'Alta';
        break;
      case 3:
        return 'Urgente';
        break;
    }
  };

  $scope.getPercConcluido = function(atividade) {
    if ($scope.registro.atualizacoes) {
      var atualizacoes = $scope.registro.atualizacoes.filter(function(atu) {
        return atu.atividade._id === atividade.atividade._id;
      });

      if (atualizacoes.length) {
        return atualizacoes.slice(-1).pop().percConcluido;
      }
    }
    return 0;
  };

  $scope.getHorasUtilizadas = function(atividade) {
    var horas = 0;

    if ($scope.registro.atualizacoes) {
      $scope.registro.atualizacoes.filter(function(atu) {
        return atu.atividade._id === atividade.atividade._id;
      }).forEach(function(atu) {
        horas += atu.horasUsadas;
      });
    }
    return horas;
  };
});
