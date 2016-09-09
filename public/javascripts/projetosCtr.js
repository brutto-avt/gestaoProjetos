angular.module('app').controller('ProjetosCtr', function($scope, $rootScope, $http, $state, $stateParams, logService) {
  $http.get('./api/usuarios').then(function(usuarios) {
    $scope.lideres = usuarios.data.filter(function(usr) {
      return usr.perfil == 1;
    });
    $scope.membros = usuarios.data.filter(function(usr) {
      return usr.perfil == 0;
    });
  });

  if (!$stateParams.projetoId) {
    $http.get('./api/projetos').then(function(projetos) {
      $scope.projetos = projetos.data;
      delete $scope.registro;
    });
  } else {
    if ($stateParams.projetoId !== 'novo') {
      $http.get('./api/projetos/' + $stateParams.projetoId).then(function(projeto) {
        $scope.registro = projeto.data;
        $scope.registro.logs = [];
        $scope.registro.status = $scope.registro.status.toString();
        $scope.registro.prioridade = $scope.registro.prioridade.toString();
        $scope.registro.deadline = new Date($scope.registro.deadline);
        $scope.registro.responsavel = $scope.registro.responsavel._id;

        $http.get('./api/projetos/' + $stateParams.projetoId + '/itens').then(function(itens) {
          $scope.registro.itens = itens.data;
          if (!$stateParams.itemId) {
            delete $scope.registro.itemSelecionado;
          } else {
            if ($stateParams.itemId !== 'novo') {
              $scope.registro.itemSelecionado = $scope.registro.itens.filter(function (it) {
                return it._id === $stateParams.itemId;
              })[0];
              $scope.registro.itemSelecionado.status = $scope.registro.itemSelecionado.status.toString();
              $scope.registro.itemSelecionado.prioridade = $scope.registro.itemSelecionado.prioridade.toString();
              $scope.registro.itemSelecionado.deadline = new Date($scope.registro.itemSelecionado.deadline);
              $scope.registro.itemSelecionado.responsavel = $scope.registro.itemSelecionado.responsavel._id;
            } else {
              $scope.registro.itemSelecionado = {
                projeto: $scope.registro._id
              };
            }
          }
        });
      });
    } else {
      $scope.registro = {};
    }
  }

  $scope.getSituacao = function(projeto) {
    switch (projeto.status) {
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

  $scope.getPrioridade = function(projeto) {
    switch (projeto.prioridade) {
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

  $scope.detalhe = function(projeto) {
    $http.get('./api/usuarios').then(function(usuarios) {
      $scope.lideres = usuarios.data.filter(function(usr) {
        return usr.perfil == 1;
      });

      $state.go('projetos.detalhe', {
        'projetoId': projeto._id
      });
    });
  };

  $scope.detalheItem = function(item) {
    $http.get('./api/usuarios').then(function(usuarios) {
      $scope.membros = usuarios.data.filter(function(usr) {
        return usr.perfil == 0;
      });

      $state.go('.item', {
        'itemId': item._id
      });
    });
  }

  $scope.gravarItem = function () {
    var metodo = 'post';

    if ($stateParams.itemId !== 'novo') {
      metodo = 'put';
    }

    $scope.registro.itemSelecionado.status = parseInt($scope.registro.itemSelecionado.status);
    $scope.registro.itemSelecionado.prioridade = parseInt($scope.registro.itemSelecionado.prioridade);

    $http[metodo]('./api/itens', $scope.registro.itemSelecionado).then(function(registro) {
      $scope.voltarItem();
    });
  }

  $scope.gravar = function() {
    var metodo = 'post';

    if ($stateParams.projetoId !== 'novo') {
      metodo = 'put';
    }

    $scope.registro.status = parseInt($scope.registro.status);
    $scope.registro.prioridade = parseInt($scope.registro.prioridade);

    $http[metodo]('./api/projetos', $scope.registro).then(function(registro) {
      logService.gravaLogs($scope.registro.logs);
      $scope.voltar();
    });
  };

  $scope.excluirItem = function() {
    $http.delete('./api/itens/' + $scope.registro.itemSelecionado._id).then(function() {
      $scope.voltarItem();
    });
  };

  $scope.excluir = function() {
    $http.delete('./api/projetos/' + $stateParams.projetoId).then(function() {
      $scope.voltar();
    });
  };

  $scope.voltar = function() {
    $state.go('projetos');
  };

  $scope.voltarItem = function() {
    $state.go('projetos.detalhe', {
      projetoId: $stateParams.projetoId
    })
  };

  $scope.verEstimativas = function(item) {
    $state.go('.item.estimativas', {
      'itemId': item._id
    });
  };

  $scope.$watch('registro.deadline', function (newVal, oldVal) {
    if ($scope.registro && $scope.registro.logs && oldVal && oldVal !== newVal) {
      $scope.registro.logs = $scope.registro.logs.filter(function (log) { return log.acao !== logService.getIdAcao('deadlineProjeto') });
      $scope.registro.logs.push(logService.criaLog($scope.registro._id, 'deadlineProjeto', newVal));
    }
  });

  $scope.$watch('registro.prioridade', function (newVal, oldVal) {
    if ($scope.registro && $scope.registro.logs && oldVal && +oldVal !== +newVal) {
      $scope.registro.logs = $scope.registro.logs.filter(function (log) { return log.acao !== logService.getIdAcao('prioridadeProjeto') });
      $scope.registro.logs.push(logService.criaLog($scope.registro._id, 'prioridadeProjeto', newVal));
    }
  });

  $scope.$watch('registro.status', function (newVal, oldVal) {
    if ($scope.registro && $scope.registro.logs && oldVal && +oldVal !== +newVal) {
      $scope.registro.logs = $scope.registro.logs.filter(function (log) { return log.acao !== logService.getIdAcao('situacaoProjeto') });
      $scope.registro.logs.push(logService.criaLog($scope.registro._id, 'situacaoProjeto', newVal));
    }
  });

  $scope.$watch('registro.responsavel', function (newVal, oldVal) {
    if ($scope.registro && $scope.registro.logs && oldVal && oldVal !== newVal) {
      $scope.registro.logs = $scope.registro.logs.filter(function (log) { return log.acao !== logService.getIdAcao('responsavelProjeto') });
      $scope.registro.logs.push(logService.criaLog($scope.registro._id, 'responsavelProjeto', newVal));
    }
  });
});
