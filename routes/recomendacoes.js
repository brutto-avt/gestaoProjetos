var express = require('express');
var request = require('request');
var DecisionTree = require('decision-tree');
var router = express.Router();

var ACOES = [
  'prioridadeProjeto',
  'deadlineProjeto',
  'responsavelProjeto',
  'situacaoProjeto'
];

router.get('/:usuario', function(req, res, next) {
  gerarRecomendacoes(req.params.usuario).then(function(rec) {
    res.json(rec);
  });
});

var gerarRecomendacoes = function(responsavel) {
  var promise = new Promise(function(resolve, reject) {
    obterLogs(responsavel).then(function(data) {
      var colunas = Object.keys(data[0]);
      var dt = new DecisionTree(data, 'decisao', colunas);
      var recomendacoes = [];

      obterEstatisticas(responsavel).then(function(est) {
        ACOES.forEach(function(acao) {
          est.acao = acao;
          recomendacoes.push({
            acao: acao,
            decisao: dt.predict(est)
          });
        });

        resolve(recomendacoes);
      });
    });
  });

  return promise;
};

var obterLogs = function(responsavel) {
  var promise = new Promise(function(resolve, reject) {
    var dados;

    request('http://localhost:8080/api/logs/usuario/' + responsavel, function(err, res, body) {
      if (!err && res.statusCode == 200) {
        resolve(JSON.parse(body));
      } else {
        resolve([]);
      }
    });
  });

  return promise;
};

var obterEstatisticas = function(responsavel) {
  var promise = new Promise(function(resolve, reject) {
    var dados;

    request('http://localhost:8080/api/estatisticas/' + responsavel, function(err, res, body) {
      if (!err && res.statusCode == 200) {
        dados = JSON.parse(body);
        resolve(normalizaEstatisticas(dados[0]));
      } else {
        resolve([]);
      }
    });
  });

  return promise;
};

var normalizaEstatisticas = function(est) {
  est.projeto = est._id;
  est.usuario = est.responsavel;

  Object.keys(est.equipe).forEach(function(membro) {
    est['membro'+membro] = est.equipe[membro];
  });

  est.itens.forEach(function(item) {
    est['itemDeadline'+item._id] = item.deadline;
    est['itemResponsavel'+item._id] = item.responsavel;
    est['itemStatus'+item._id] = item.status;
    est['itemPrioridade'+item._id] = item.prioridade;
    est['itemPercConcluido'+item._id] = item.percConcluido;
    est['itemDiasRestantes'+item._id] = item.diasRestantes;
    est['itemHorasUsadas'+item._id] = item.horasUsadas;
    est['itemHorasEstimadas'+item._id] = item.horasEstimadas;
    est['itemRazaoEstimativa'+item._id] = item.razaoEstimativa;
    est['itemSituacao'+item._id] = item.situacao;
  });

  delete est.nome;
  delete est._id;
  delete est.equipe;
  delete est.itens;
  delete est.responsavel;

  return est;
};

module.exports = router;
