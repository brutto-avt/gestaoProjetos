require('../models/projetoItemAtividade');
require('../models/projetoItemStatus');
require('../models/projeto');
require('../models/projetoItem');

var express = require('express');
var mongoose = require('mongoose');
var async = require('async');
var Projeto = mongoose.model('Projeto');
var ProjetoItem = mongoose.model('ProjetoItem');
var ProjetoItemAtividade = mongoose.model('ProjetoItemAtividade');
var ProjetoItemStatus = mongoose.model('ProjetoItemStatus');
var router = express.Router();

router.get('/:responsavel?', function(req, res, next) {
  var params = {}
  if (req.params.responsavel) params.responsavel = req.params.responsavel;
  Projeto.find(params, function(err, projetos) {
    if (!projetos.length) {
      res.json([]);
      return;
    }

    async.map(projetos, function(projeto, callBack) {
      populaItens(projeto).then(function(itens) {
        var ret = projeto.toObject();
        ret.itens = itens;
        callBack(null, ret);
      });
    }, function(err, projetos) {
      projetos.forEach(function(proj) {
        var percConcluido = 0;
        var itensConcluidos = 0;
        var totalUsadas = 0;
        var totalEstimadas = 0;
        var limite = (new Date() - proj.deadline) / (1000 * 60 * 60 * 24);

        proj.equipe = {};

        proj.itens.forEach(function(item) {
          var usadasItem = 0;
          var estimadasItem = 0;

          if ([2, 3].indexOf(item.status)) {
            itensConcluidos += 1;
          }

          if (!proj.equipe.hasOwnProperty(item.responsavel)) {
            proj.equipe[item.responsavel] = 0;
          }

          item.atualizacoes.forEach(function(at) {
            proj.equipe[item.responsavel] += at.horasUsadas;
            totalUsadas += at.horasUsadas;
            usadasItem += at.horasUsadas;

            if (!proj.hasOwnProperty('horasUsadas' + at.atividade)) {
              proj['horasUsadas' + at.atividade] = 0;
            }

            proj['horasUsadas' + at.atividade] += at.horasUsadas;
          });

          item.atividades.forEach(function(ativ) {
            totalEstimadas += ativ.avaliacao;
            estimadasItem += ativ.avaliacao;

            if (!proj.hasOwnProperty('horasEstimadas' + ativ.atividade)) {
              proj['horasEstimadas' + ativ.atividade] = 0;
            }

            proj['horasEstimadas' + ativ.atividade] += ativ.avaliacao;
          });
          
          if (item.atualizacoes.length) {
            item.percConcluido = item.atualizacoes[item.atualizacoes.length - 1].percConcluido;
          } else {
            item.percConcluido = 0;
          }
          item.diasRestantes = calculaData(new Date(), item.deadline);
          item.horasUsadas = usadasItem;
          item.horasEstimadas = estimadasItem;
          if (estimadasItem > 0) {
            item.razaoEstimativa = Math.floor(usadasItem / estimadasItem);
          }

          if (item.deadline < new Date()) {
            item.situacao = 'A';
          } else if (item.percConcluido < 90 && limite <= 3) {
            item.situacao = 'R';
          } else {
            item.situacao = 'N';
          }

          delete item.atividades;
          delete item.atualizacoes;
        });

        proj.percConcluido = (itensConcluidos * 100) / proj.itens.length;
        proj.horasUsadas = totalUsadas;
        proj.horasEstimadas = totalEstimadas;
        if (totalEstimadas > 0) {
          proj.razaoEstimativa = Math.floor(totalUsadas / totalEstimadas);
        }
        proj.diasRestantes = calculaData(new Date(), proj.deadline);

        if (proj.deadline < new Date()) {
          proj.situacao = 'A';
        } else if (proj.percConcluido < 90 && limite <= 3) {
          proj.situacao = 'R';
        } else {
          proj.situacao = 'N';
        }
      });

      if (req.query.ultimos) {
        res.json(projetos.filter(function (proj) {
          var trintaDias = new Date();
          trintaDias.setDate(trintaDias.getDate() - 30);
          return proj.deadline >= trintaDias;
        }));
      }

      res.json(projetos);
    });
  }).select('_id, deadline prioridade status nome');
});

var populaItens = function(projeto) {
  var promise = new Promise(function(resolve, reject) {
    ProjetoItem.find({
      'projeto': projeto._id
    }, function(err, itens) {
      if (!itens.length) {
        resolve([]);
        return;
      }

      async.map(itens, function(item, callBack) {
        populaItem(item).then(function(item) {
          callBack(null, item);
        });
      }, function(err, itens) {
        resolve(itens);
      });
    }).select('_id deadline prioridade status responsavel');
  });

  return promise;
};

var populaItem = function(item) {
  var promise = new Promise(function(resolve, reject) {
    buscaStatus(item).then(function(stats) {
      var ret = item.toObject();
      ret.atualizacoes = stats;
      buscaAtividades(item).then(function(ativs) {
        ret.atividades = ativs;
        resolve(ret);
      });
    });
  });

  return promise;
}

var buscaStatus = function(item) {
  var promise = new Promise(function(resolve, reject) {
    ProjetoItemStatus.find({
      'item': item._id
    }, function(err, stats) {
      resolve(stats);
    }).select('_id atividade horasUsadas percConcluido');
  });

  return promise;
};

var buscaAtividades = function(item) {
  var promise = new Promise(function(resolve, reject) {
    ProjetoItemAtividade.find({
      'item': item._id
    }, function(err, ativs) {
      resolve(ativs);
    }).select('_id atividade avaliacao');
  });

  return promise;
};

var calculaData = function(primeira, segunda) {
  primeira = new Date(primeira.getFullYear(), primeira.getMonth(), primeira.getDate());
  segunda = new Date(segunda.getFullYear(), segunda.getMonth(), segunda.getDate());
  return Math.floor((segunda.getTime() - primeira.getTime()) / (1000 * 60 * 60 * 24));
};

module.exports = router;
