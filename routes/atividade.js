require('../models/atividade');

var express = require('express');
var mongoose = require('mongoose');
var Atividade = mongoose.model('Atividade');
var router = express.Router();

router.get('/', function(req, res, next) {
  Atividade.find(function(err, atividades) {
    if(err) return next(err);
    res.json(atividades);
  });
});

router.get('/:id', function(req, res, next) {
  var query = Atividade.findById(req.params.id);

  query.exec(function(err, atividade) {
    if (err) return next(err);
    if (!atividade) return next(new Error('atividade não encontrada'));
    res.json(atividade);
  });
});

router.post('/', function(req, res, next) {
  var atividade = new Atividade(req.body);

  atividade.save(function(err, atividade){
    if(err) return next(err);
    res.json(atividade);
  });
});

router.put('/', function(req, res, next) {
  var query = {'_id': req.body._id};

  Atividade.findOneAndUpdate(query, req.body, {new: true}, function(err, atividade) {
    if (err) return next(err);
    if (!atividade) return next(new Error('atividade não encontrada'));
    res.json(atividade);
  });
});

router.delete('/:id', function(req, res, next) {
  var query = Atividade.findById(req.params.id);

  query.exec(function(err, atividade) {
    if (err) return next(err);
    if (!atividade) return next(new Error('atividade não encontrada'));
    atividade.remove();
    res.json(atividade);
  });
});

module.exports = router;
