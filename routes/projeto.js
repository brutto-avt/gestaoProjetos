require('../models/projeto');
require('../models/projetoItem');

var express = require('express');
var mongoose = require('mongoose');
var Projeto = mongoose.model('Projeto');
var ProjetoItem = mongoose.model('ProjetoItem');
var router = express.Router();

router.get('/', function(req, res, next) {
  Projeto.find(function(err, projetos) {
    if(err) return next(err);
    res.json(projetos);
  });
});

router.get('/:id', function(req, res, next) {
  var query = Projeto.findById(req.params.id).populate('responsavel');

  query.exec(function(err, projeto) {
    if (err) return next(err);
    if (!projeto) return next(new Error('projeto não encontrado'));
    res.json(projeto);
  });
});

router.get('/:id/itens', function(req, res, next) {
  var query = ProjetoItem.find({'projeto': req.params.id});

  query.exec(function(err, itens) {
    if (err) return next(err);
    res.json(itens);
  });
});

router.post('/', function(req, res, next) {
  var projeto = new Projeto(req.body);

  projeto.save(function(err, projeto){
    if(err) return next(err);
    res.json(projeto);
  });
});

router.put('/', function(req, res, next) {
  var query = {'_id': req.body._id};

  Projeto.findOneAndUpdate(query, req.body, {new: true}, function(err, projeto) {
    if (err) return next(err);
    if (!projeto) return next(new Error('projeto não encontrado'));
    res.json(projeto);
  });
});

router.delete('/:id', function(req, res, next) {
  var query = Projeto.findById(req.params.id);

  query.exec(function(err, projeto) {
    if (err) return next(err);
    if (!projeto) return next(new Error('projeto não encontrado'));
    projeto.remove();
    res.json(projeto);
  });
});

module.exports = router;
