require('../models/acao');

var express = require('express');
var mongoose = require('mongoose');
var Acao = mongoose.model('Acao');
var router = express.Router();

router.get('/', function(req, res, next) {
  Acao.find(function(err, acoes) {
    if(err) return next(err);
    res.json(acoes);
  });
});

router.get('/:id', function(req, res, next) {
  var query = Acao.findById(req.params.id);

  query.exec(function(err, acao) {
    if (err) return next(err);
    if (!acao) return next(new Error('ação não encontrada'));
    res.json(acao);
  });
});

router.post('/', function(req, res, next) {
  var acao = new Acao(req.body);

  acao.save(function(err, acao){
    if(err) return next(err);
    res.json(acao);
  });
});

router.put('/', function(req, res, next) {
  var query = {'_id': req.body._id};

  Acao.findOneAndUpdate(query, req.body, {new: true}, function(err, acao) {
    if (err) return next(err);
    if (!acao) return next(new Error('ação não encontrada'));
    res.json(acao);
  });
});

router.delete('/:id', function(req, res, next) {
  var query = Acao.findById(req.params.id);

  query.exec(function(err, acao) {
    if (err) return next(err);
    if (!acao) return next(new Error('ação não encontrada'));
    acao.remove();
    res.json(acao);
  });
});

module.exports = router;
