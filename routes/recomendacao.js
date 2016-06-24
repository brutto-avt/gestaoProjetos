require('../models/recomendacao');
require('../models/usuario');
require('../models/projeto');

var express = require('express');
var request = require('request');
var async = require('async');
var mongoose = require('mongoose');
var DecisionTree = require('decision-tree');
var router = express.Router();
var Recomendacao = mongoose.model('Recomendacao');
var Usuario = mongoose.model('Usuario');
var Projeto = mongoose.model('Projeto');

var ACOES = [
  'prioridadeProjeto',
  'deadlineProjeto',
  'responsavelProjeto',
  'situacaoProjeto'
];

router.get('/gerar', function(req, res, next) {
  Usuario.find(function(err, usuarios) {
    if (err) return next(err);

    async.map(usuarios, function(usuario, callBack) {
      gerarRecomendacoes(usuario['_id']).then(function() {
        callBack(null, null);
      });
    }, function() {
      res.end('Recomendações geradas.');
    })
  });
});

router.get('/:usuario', function(req, res, next) {
  var query = Recomendacao.find({
    usuario: req.params.usuario
  }).populate('usuario');

  query.exec(function(err, recs) {
    if (err) return next(err);
    res.json(recs);
  });
});

router.put('/', function(req, res, next) {
  var query = {
    '_id': req.body._id
  };

  Recomendacao.findOneAndUpdate(query, req.body, {
    new: true
  }, function(err, rec) {
    if (err) return next(err);
    if (!rec) return next(new Error('recomendação não encontrada'));
    res.json(rec);
  });
});

var gerarRecomendacoes = function(responsavel) {
  var promise = new Promise(function(resolve, reject) {
    obterLogs(responsavel).then(function(logs) {
      if (!logs.length) {
        resolve(0);
      } else {
        var colunas = Object.keys(logs[0]);
        var recomendacoes = [];

        obterEstatisticas(responsavel).then(function(estats) {
          async.map(estats, function(est, callBack) {
            ACOES.forEach(function(acao) {
              var logsAcao = logs.filter(function(l) {
                return l.acao == acao
              });
              var referencia = '' + est['_id'];
              if (!logsAcao.length) resolve([]);
              var dt = new DecisionTree(logsAcao, 'decisao', colunas);

              delete est['_id'];
              delete est['nome'];
              est.acao = acao;
              est.usuario = responsavel;

              getDesicaoStr(acao, referencia, dt.predict(est)).then(function(descricao) {
                if (!descricao) {
                  callBack(null, null);
                } else {
                  var recomendacao = new Recomendacao({
                    usuario: responsavel,
                    referencia: referencia,
                    decisao: descricao,
                    visualizada: false
                  });

                  recomendacao.save(function(err, rec) {
                    if (err) console.trace(err);
                    callBack(null, 1);
                  });
                }
              });
            });
          }, function() { resolve(0); });
        });
      }
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
        resolve(dados);
      } else {
        resolve([]);
      }
    });
  });

  return promise;
};

var getDesicaoStr = function(acao, referencia, decisao) {
  var promise = new Promise(function(resolve, reject) {
    getProjeto(referencia).then(function(projeto) {
      switch (acao) {
        case 'prioridadeProjeto':
          if (projeto.prioridade == decisao) {
            resolve(undefined);
          } else {
            resolve('Considere alterar a prioridade do projeto ' + projeto.nome + ' para ' + getPrioridade(decisao));
          }
          break;
        case 'deadlineProjeto':
          if (projeto.deadline == decisao) {
            resolve(undefined);
          } else {
            resolve('Considere alterar o deadline do projeto ' + projeto.nome + ' para ' + decisao);
          }
          break;
        case 'responsavelProjeto':
          getResponsavel(decisao).then(function(novoResponsavel) {
            if (projeto.responsavel == decisao) {
              resolve(undefined);
            } else {
              resolve('Considere transferir o projeto ' + projeto.nome + ' para ' + novoResponsavel);
            }
          });
          break;
        case 'situacaoProjeto':
          if (projeto.status == decisao) {
            resolve(undefined);
          } else {
            resolve('Considere alterar a situação do projeto ' + projeto.nome + ' para ' + getSituacao(decisao));
          }
          break;
      };
    });
  });

  return promise;
};

var getSituacao = function(sit) {
  switch (sit) {
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

var getPrioridade = function(prior) {
  switch (prior) {
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

var getResponsavel = function(resp) {
  var promise = new Promise(function(resolve, reject) {
    var query = Usuario.findById(resp);

    query.exec(function(err, usuario) {
      if (err) resolve(undefined);
      if (!usuario) resolve(undefined);
      resolve(usuario.nome);
    });
  });

  return promise;
};

var getProjeto = function(proj) {
  var promise = new Promise(function(resolve, reject) {
    var query = Projeto.findById(proj);

    query.exec(function(err, projeto) {
      if (err) resolve(undefined);
      if (!projeto) resolve(undefined);
      resolve(projeto);
    });
  });

  return promise;
};

module.exports = router;
