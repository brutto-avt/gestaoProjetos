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
        var totalUsadas = 0;
        var totalEstimadas = 0;

        proj.itensPriorBaixa = 0;
        proj.itensPriorMedia = 0;
        proj.itensPriorAlta = 0;
        proj.itensPriorUrgente = 0;

        proj.itensSitPendente = 0;
        proj.itensSitDesenvolv = 0;
        proj.itensSitEncerrado = 0;
        proj.itensSitCancelado = 0;

        proj.itensAtrasados = 0;
        proj.itensRisco = 0;
        proj.itensNormais = 0;

        proj.horasUsadasPorItem = 0;
        proj.horasEstimadasPorItem = 0;
        proj.razaoEstimativaPorItem = 0;

        proj.horasUsadasPorMembro = 0;
        proj.horasEstimadasPorMembro = 0;
        proj.razaoEstimativaPorMembro = 0;

        proj.diasRestantes = calculaData(new Date(), proj.deadline);

        proj.equipe = {};

        proj.itens.forEach(function(item) {
          item.horasUsadas = 0;
          item.horasEstimadas = 0;

          switch (item.prioridade) {
            case 0:
              proj.itensPriorBaixa += 1;
              break;
            case 1:
              proj.itensPriorMedia += 1;
              break;
            case 2:
              proj.itensPriorAlta += 1;
              break;
            case 3:
              proj.itensPriorUrgente += 1;
              break;
          }

          switch (item.status) {
            case 0:
              proj.itensSitPendente += 1;
              break;
            case 1:
              proj.itensSitDesenvolv += 1;
              break;
            case 2:
              proj.itensSitEncerrado += 1;
              break;
            case 3:
              proj.itensSitCancelado += 1;
              break;
          }

          if (!proj.equipe.hasOwnProperty(item.responsavel)) {
            proj.equipe[item.responsavel] = {
              horasUsadas: 0,
              horasEstimadas: 0
            };
          }

          item.atualizacoes.forEach(function(at) {
            proj.equipe[item.responsavel].horasUsadas += at.horasUsadas;

            totalUsadas += at.horasUsadas;
            item.horasUsadas += at.horasUsadas;
          });

          item.atividades.forEach(function(ativ) {
            proj.equipe[item.responsavel].horasEstimadas += ativ.avaliacao;

            totalEstimadas += ativ.avaliacao;
            item.horasEstimadas += ativ.avaliacao;
          });

          if (item.deadline < new Date()) {
            proj.itensAtrasados += 1;
          } else if (item.percConcluido < 90 && proj.diasRestantes <= 3) {
            proj.itensRisco += 1;
          } else {
            proj.itensNormais += 1;
          }

          delete item.atividades;
          delete item.atualizacoes;
        });

        proj.horasUsadasPorItem = totalUsadas / proj.itens.length;
        proj.horasEstimadasPorItem = totalEstimadas / proj.itens.length;
        if (proj.horasEstimadasPorItem > 0) {
          proj.razaoEstimativaPorItem = Math.floor((proj.horasUsadasPorItem / proj.horasEstimadasPorItem) * 100);
        }

        proj.horasUsadasPorMembro = totalUsadas / Object.keys(proj.equipe).length;
        proj.horasEstimadasPorMembro = totalEstimadas / Object.keys(proj.equipe).length;
        if (proj.horasEstimadasPorMembro > 0) {
          proj.razaoEstimativaPorMembro = Math.floor((proj.horasUsadasPorMembro / proj.horasEstimadasPorMembro) * 100);
        }

        proj.percConcluido = (proj.itensSitEncerrado * 100) / proj.itens.length;
        proj.horasUsadas = totalUsadas;
        proj.horasEstimadas = totalEstimadas;
        if (totalEstimadas > 0) {
          proj.razaoEstimativa = Math.floor((totalUsadas / totalEstimadas) * 100);
        }

        if (proj.deadline < new Date()) {
          proj.situacao = 'A';
        } else if (proj.percConcluido < 90 && proj.diasRestantes <= 3) {
          proj.situacao = 'R';
        } else {
          proj.situacao = 'N';
        }

        delete proj.itens;
        delete proj.equipe;
      });

      if (req.query.ultimos) {
        res.json(projetos.filter(function (proj) {
          var trintaDias = new Date();
          trintaDias.setDate(trintaDias.getDate() - 30);
          return proj.deadline >= trintaDias;
        }));
      } else if (req.params.responsavel) {
        res.json(projetos.filter(function(proj) {
          return [0,1].indexOf(proj.status) > -1;
        }));
      } else {
        res.json(projetos);
      }
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
