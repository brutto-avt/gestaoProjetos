require('../models/projetoItem');
require('../models/projetoItemAtividade');
require('../models/projetoItemStatus');

var express = require('express');
var mongoose = require('mongoose');
var ProjetoItem = mongoose.model('ProjetoItem');
var ProjetoItemAtividade = mongoose.model('ProjetoItemAtividade');
var ProjetoItemStatus = mongoose.model('ProjetoItemStatus');
var router = express.Router();

router.get('/', function(req, res, next) {
  ProjetoItem.find(function(err, itens) {
    if(err) return next(err);
    res.json(itens);
  }).populate('projeto').populate('responsavel');
});

router.get('/:id', function(req, res, next) {
  var query = ProjetoItem.findById(req.params.id).populate('responsavel');

  query.exec(function(err, item) {
    if (err) return next(err);
    if (!item) return next(new Error('item não encontrado'));
    res.json(item);
  });
});

router.post('/', function(req, res, next) {
  var item = new ProjetoItem(req.body);

  item.save(function(err, item){
    if(err) return next(err);
    res.json(item);
  });
});

router.put('/', function(req, res, next) {
  var query = {'_id': req.body._id};

  ProjetoItem.findOneAndUpdate(query, req.body, {new: true}, function(err, item) {
    if (err) return next(err);
    if (!item) return next(new Error('item não encontrado'));
    res.json(item);
  });
});

router.delete('/:id', function(req, res, next) {
  var query = ProjetoItem.findById(req.params.id);

  query.exec(function(err, item) {
    if (err) return next(err);
    if (!item) return next(new Error('item não encontrado'));
    item.remove();
    res.json(item);
  });
});

// Atividades
router.get('/:id/atividades', function(req, res, next) {
  var query = ProjetoItemAtividade.find({'item': req.params.id}).populate('atividade');

  query.exec(function(err, atividades) {
    if (err) return next(err);
    res.json(atividades);
  });
});

router.get('/:id/atividades/:atividadeId', function(req, res, next) {
  var query = ProjetoItemAtividade.findById(req.params.atividadeId).populate('item').populate('projeto').populate('atividade');

  query.exec(function(err, atividade) {
    if (err) return next(err);
    if (!atividade) return next(new Error('atividade não encontrada'));
    res.json(atividade);
  });
});

router.post('/:id/atividades', function(req, res, next) {
  var atividade = new ProjetoItemAtividade(req.body);
  var query = ProjetoItem.findById(req.params.id);

  query.exec(function(err, item) {
    if (err) return next(err);
    if (!item) return next(new Error('item não encontrado'));

    atividade.item = req.params.id;
    atividade.projeto = item.projeto;

    atividade.save(function(err, atividade){
      if(err) return next(err);
      res.json(atividade);
    });
  });
});

router.put('/:id/atividades', function(req, res, next) {
  var query = {'_id': req.body._id};

  ProjetoItemAtividade.findOneAndUpdate(query, req.body, {new: true}, function(err, atividade) {
    if (err) return next(err);
    if (!atividade) return next(new Error('atividade não encontrada'));
    res.json(atividade);
  });
});

router.delete('/:id/atividades/:atividadeId', function(req, res, next) {
  var query = ProjetoItemAtividade.findById(req.params.atividadeId);

  query.exec(function(err, atividade) {
    if (err) return next(err);
    if (!atividade) return next(new Error('atividade não encontrada'));
    atividade.remove();
    res.json(atividade);
  });
});

// Status
router.get('/:id/status', function(req, res, next) {
  var query = ProjetoItemStatus.find({'item': req.params.id}).populate('atividade');

  query.exec(function(err, status) {
    if (err) return next(err);
    res.json(status);
  });
});

router.get('/:id/status/:statusId', function(req, res, next) {
  var query = ProjetoItemStatus.findById(req.params.statusId).populate('item').populate('usuario').populate('atividade');

  query.exec(function(err, status) {
    if (err) return next(err);
    if (!status) return next(new Error('status não encontrado'));
    res.json(status);
  });
});

router.post('/:id/status', function(req, res, next) {
  var status = new ProjetoItemStatus(req.body);
  status.item = req.params.id;

  status.save(function(err, status){
    if(err) return next(err);
    res.json(status);
  });
});

router.put('/:id/status', function(req, res, next) {
  var status = {'_id': req.body._id};

  ProjetoItemStatus.findOneAndUpdate(query, req.body, {new: true}, function(err, status) {
    if (err) return next(err);
    if (!status) return next(new Error('status não encontrado'));
    res.json(status);
  });
});

router.delete('/:id/status/:statusId', function(req, res, next) {
  var query = ProjetoItemStatus.findById(req.params.statusId);

  query.exec(function(err, status) {
    if (err) return next(err);
    if (!status) return next(new Error('status não encontrado'));
    status.remove();
    res.json(status);
  });
});

module.exports = router;
