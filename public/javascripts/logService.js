angular.module('app').factory('logService', function($http, $cookies) {
  var ACOES = {
    'prioridadeProjeto': '56fdcc310c4515a9994a953e',
    'deadlineProjeto': '56fdcc4b0c4515a9994a953f',
    'responsavelProjeto': '56fdcc5e0c4515a9994a9540',
    'situacaoProjeto': '56fdcc700c4515a9994a9541',
    'prioridadeItem': '56fdcca40c4515a9994a9542',
    'responsavelItem': '56fdccad0c4515a9994a9543',
    'deadlineItem': '56fdccb80c4515a9994a9544',
    'situacaoItem': '56fdccc80c4515a9994a9545',
    'estimativaItem': '56fdccef0c4515a9994a9546',
    'percItem': '56fdcd4f0c4515a9994a9547',
    'horasItem': '56fdcd580c4515a9994a9548'
  };

  return {
    getIdAcao: function(acao) {
      return ACOES[acao];
    },
    gravaLogs: function(logs) {
      logs.forEach(function(log) {
        $http.post('./api/logs', log);
      });
    },
    criaLog: function(referencia, acao, decisao) {
      return {
        referencia: referencia,
        acao: ACOES[acao],
        decisao: decisao,
        usuario: $cookies.get('usuario')
      };
    }
  }
});
