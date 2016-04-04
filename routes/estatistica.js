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

router.get('/:responsavel', function(req, res, next) {
  var retorno = [];

  Projeto.find({'responsavel': req.params.responsavel}, function(err, projetos) {
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
      projetos.forEach(function (proj) {
        var percConcluido = 0;
        var itensConcluidos = 0;
        var limite = (new Date() - proj.deadline) / (1000 * 60 * 60 * 24);

        proj.equipe = {};

        proj.itens.forEach(function(item) {
          if ([2,3].indexOf(item.status)) {
            itensConcluidos += 1;
          }

          if (!proj.equipe.hasOwnProperty(item.responsavel)) {
            proj.equipe[item.responsavel] = 0;
          }

          item.atualizacoes.forEach(function (at) {
            proj.equipe[item.responsavel] += at.horasUsadas;
          });
        });

        proj.percConcluido = (itensConcluidos * 100) / proj.itens.length;

        if (proj.deadline < new Date()) {
          proj.situacao = 'A';
        } else if (proj.percConcluido < 90 && limite <= 3) {
          proj.situacao = 'R';
        } else {
          proj.situacao = 'N';
        }
      });

      res.json(projetos);
    });
  }).select('_id, deadline prioridade status nome');
});

var populaItens = function (projeto) {
  var promise = new Promise(function (resolve, reject ) {
    ProjetoItem.find({'projeto': projeto._id}, function (err, itens) {
      if (!itens.length) {
        resolve([]);
        return;
      }

      async.map(itens, function(item, callBack) {
        populaItem(item).then(function(item) {
          callBack(null, item);
        });
      }, function (err, itens) {
        resolve(itens);
      });
    }).select('_id deadline prioridade status responsavel');
  });

  return promise;
};

var populaItem = function (item) {
  var promise = new Promise(function (resolve, reject) {
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
  var promise = new Promise(function (resolve, reject) {
    ProjetoItemStatus.find({'item': item._id}, function (err, stats) {
      resolve(stats);
    }).select('_id atividade horasUsadas percConcluido');
  });

  return promise;
};

var buscaAtividades = function(item) {
  var promise = new Promise(function (resolve, reject) {
    ProjetoItemAtividade.find({'item': item._id}, function (err, ativs) {
      resolve(ativs);
    }).select('_id atividade avaliacao');
  });

  return promise;
};

module.exports = router;
