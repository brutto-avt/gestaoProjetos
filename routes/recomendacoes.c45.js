var express = require('express');
var json2csv = require('json2csv');
var request = require('request');
var csv = require('csv');
var C45 = require('c4.5');
var router = express.Router();

router.get('/:usuario', function(req, res, next) {
  gerarRecomendacoes(req.params.usuario).then(function(rec) {
    debugger;
    res.end(rec);
  });
});

var gerarRecomendacoes = function(responsavel) {
  var promise = new Promise(function(resolve, reject) {
    obterLogs(responsavel).then(function(data) {
      var headers = data[0];
      var colunas = headers.slice(1, -1);
      var c45 = C45();
      var treino = data.slice(1).map(function(d) {
        return d.slice(1);
      });
      var tipos = treino[0].map(function(d) {
        return isNaN(d) ? 'category' : 'number';
      });

      obterEstatisticas(responsavel).then(function(est) {
        c45.train({
          data: treino,
          target: 'decisao',
          features: colunas,
          featureTypes: tipos
        }, function(err, modelo) {
          debugger;
          if (err) {
            resolve(err);
          } else {
            resolve(modelo.classify(est));
          }
        });
      });
    });
  });

  return promise;
};

var obterLogs = function(responsavel) {
  var promise = new Promise(function(resolve, reject) {
    var dados;
    var campos;
    var retorno;

    request('http://localhost:8080/api/logs/usuario/' + responsavel, function(err, res, body) {
      if (!err && res.statusCode == 200) {
        dados = JSON.parse(body);
        campos = Object.keys(dados[0]);
        retorno = [];

        retorno.push(campos);
        dados.forEach(function(linha) {
          var item = [];
          Object.keys(linha).forEach(function(col) {
            item.push(linha[col]);
          });
          retorno.push(item);
        });

        resolve(retorno);
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
    var campos;
    var retorno = [];

    request('http://localhost:8080/api/estatisticas/' + responsavel, function(err, res, body) {
      if (!err && res.statusCode == 200) {
        dados = JSON.parse(body);
        dados = normalizaEstatisticas(dados[0]);

        Object.keys(dados).forEach(function(col) {
          retorno.push(dados[col]);
        });

        resolve(retorno);
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
  est.acao = 'prioridadeProjeto';

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
