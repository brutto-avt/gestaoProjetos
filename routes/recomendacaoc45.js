require('../models/recomendacao');
require('../models/usuario');
require('../models/projeto');

var express = require('express');
var request = require('request');
var async = require('async');
var mongoose = require('mongoose');
var C45 = require('c4.5');
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

var TIPOS = [
  'category',
  'number',
  'number',
  'number',
  'number',
  'number',
  'number',
  'number',
  'number',
  'number',
  'number',
  'number',
  'number',
  'number',
  'number',
  'number',
  'number',
  'number',
  'number',
  'number',
  'number',
  'number',
  'number',
  'number',
  'number',
  'number',
  'category'
];

router.get('/gerar', function (req, res, next) {
  Usuario.find(function (err, usuarios) {
    if (err) return next(err);

    async.map(usuarios, function (usuario, callBack) {
      gerarRecomendacoes(usuario['_id']).then(function () {
        callBack(null, null);
      });
    }, function () {
      res.end('Recomendações geradas.');
    });
  });
});

router.get('/:usuario', function (req, res, next) {
  var query = Recomendacao.find({
    usuario: req.params.usuario,
    visualizada: false
  }).populate('usuario');

  query.exec(function (err, recs) {
    if (err)
      return next(err);
    res.json(recs);
  });
});

router.put('/', function (req, res, next) {
  var query = {
    '_id': req.body.data._id
  };

  Recomendacao.findOneAndUpdate(query, req.body.data, {
    new : true
  }, function (err, rec) {
    if (err)
      return next(err);
    if (!rec)
      return next(new Error('recomendação não encontrada'));
    res.json(rec);
  });
});

var gerarRecomendacoes = function (responsavel) {
  var promise = new Promise(function (resolve) {
    obterLogs(responsavel).then(function (logs) {
      if (!logs.length) {
        resolve(0);
      } else {
        obterEstatisticas(responsavel).then(function (estats) {
          estats.forEach(function(est){
            ACOES.forEach(function (acao) {
              est.acao = '' + acao;
              est.usuario = responsavel;

              var logsAcao = logs.filter(function (l) {
                return l.acao === acao;
              });
              var referencia = '' + est['_id'];
              var colunas = Object.keys(logs[0]);
              colunas.splice(colunas.indexOf('usuario'), 1);
              colunas.splice(colunas.indexOf('deadline'), 1);

              if (!logsAcao.length) resolve([]);

              converterArray(logsAcao).then(function (convertidos) {
                var c45 = C45();
                
                c45.train({
                  data: convertidos,
                  target: 'decisao',
                  features: colunas,
                  featureTypes: TIPOS
                }, function (err, modelo) {
                  if (err) {
                    console.trace(err);
                  } else {
                    delete est['_id'];
                    delete est['nome'];
                    est['decisao'] = null;

                    converterObjeto(est).then(function (estConvertido) {
                      getDesicaoStr(acao, referencia, modelo.classify(estConvertido)).then(function (descricao) {
                        if (descricao) {
                          var recomendacao = new Recomendacao({
                            usuario: responsavel,
                            referencia: referencia,
                            decisao: descricao,
                            visualizada: false
                          });

                          recomendacao.save(function (err, rec) {
                            if (err) console.trace(err);
                          });
                        }
                      });
                    });
                  }
                });
              });
            });
          });
        });
      }
    });
  });

  return promise;
};

var obterLogs = function (responsavel) {
  var promise = new Promise(function (resolve, reject) {
    request('http://localhost:8080/api/logs/usuario/' + responsavel, function (err, res, body) {
      if (!err && res.statusCode === 200) {
        resolve(JSON.parse(body));
      } else {
        resolve([]);
      }
    });
  });

  return promise;
};

var obterEstatisticas = function (responsavel) {
  var promise = new Promise(function (resolve, reject) {
    var dados;

    request('http://localhost:8080/api/estatisticas/' + responsavel, function (err, res, body) {
      if (!err && res.statusCode === 200) {
        dados = JSON.parse(body);
        resolve(dados);
      } else {
        resolve([]);
      }
    });
  });

  return promise;
};

var getDesicaoStr = function (acao, referencia, decisao) {
  var promise = new Promise(function (resolve) {
    getProjeto(referencia).then(function (projeto) {
      switch (acao) {
        case 'prioridadeProjeto':
          if (projeto.prioridade === decisao) {
            resolve(undefined);
          } else {
            resolve('Considere alterar a prioridade do projeto ' + projeto.nome + ' para ' + getPrioridade(decisao));
          }
          break;
        case 'deadlineProjeto':
          if (projeto.deadline === decisao) {
            resolve(undefined);
          } else {
            resolve('Considere aumentar o deadline do projeto ' + projeto.nome + ' em ' + decisao + ' dias');
          }
          break;
        case 'responsavelProjeto':
          getResponsavel(decisao).then(function (novoResponsavel) {
            if (projeto.responsavel === decisao) {
              resolve(undefined);
            } else {
              resolve('Considere transferir o projeto ' + projeto.nome + ' para ' + novoResponsavel);
            }
          });
          break;
        case 'situacaoProjeto':
          if (projeto.status === decisao) {
            resolve(undefined);
          } else {
            resolve('Considere alterar a situação do projeto ' + projeto.nome + ' para ' + getSituacao(decisao));
          }
          break;
      }
      ;
    });
  });

  return promise;
};

var getSituacao = function (sit) {
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

var getPrioridade = function (prior) {
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

var getResponsavel = function (resp) {
  var promise = new Promise(function (resolve, reject) {
    var query = Usuario.findById(mongoose.Types.ObjectId(resp));

    query.exec(function (err, usuario) {
      if (err)
        resolve(undefined);
      if (!usuario)
        resolve(undefined);
      resolve(usuario.nome);
    });
  });

  return promise;
};

var getProjeto = function (proj) {
  var promise = new Promise(function (resolve, reject) {
    var query = Projeto.findById(mongoose.Types.ObjectId(proj));

    query.exec(function (err, projeto) {
      if (err)
        resolve(undefined);
      if (!projeto)
        resolve(undefined);
      resolve(projeto);
    });
  });

  return promise;
};

var converterArray = function (arr) {
  return new Promise(function (resolve) {
    var novoArray = [];

    for (var i = 0; i < arr.length; i++) {
      converterObjeto(arr[i]).then(function (convertido) {
        novoArray.push(convertido);

        if (i === arr.length) {
          resolve(novoArray);
        }
      });
    }
  });
};

var converterObjeto = function (obj) {
  return new Promise(function (resolve) {
    var novo = [];
    var chaves = Object.keys(obj).sort();

    chaves.splice(chaves.indexOf('usuario'), 1);
    chaves.splice(chaves.indexOf('deadline'), 1);
    chaves.splice(chaves.indexOf('acao'), 1);

    for (var i = 0; i < chaves.length; i++) {
      novo.push(obj[chaves[i]]);

      if (i === (chaves.length - 1)) {
        resolve(novo);
      }
    }
  });
};

module.exports = router;
