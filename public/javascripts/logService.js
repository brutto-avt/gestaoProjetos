angular.module('app').factory('logService', function($http, $cookies) {
  var ACOES = {
    'prioridadeProjeto': '56fdcc310c4515a9994a953e',
    'deadlineProjeto': '56fdcc4b0c4515a9994a953f',
    'responsavelProjeto': '56fdcc5e0c4515a9994a9540',
    'situacaoProjeto': '56fdcc700c4515a9994a9541'
  };

  return {
    getIdAcao: function(acao) {
      return ACOES[acao];
    },
    gravaLogs: function(logs) {
      if (!logs) return;
      logs.forEach(function(log) {
        $http.get('./api/estatisticas/' + $cookies.get('usuario')).then(function(res) {
          var estatitica = res.data.filter(function(est) { return est['_id'] == log.referencia; });
          if (estatitica.length) {
            estatitica = estatitica[0];
            delete estatitica['_id'];
            delete estatitica['nome'];
            for (var chave in estatitica) { log[chave] = estatitica[chave]; }
          }

          $http.post('./api/logs', log);
        });
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
