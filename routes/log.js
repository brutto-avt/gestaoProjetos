require('../models/log');
require('../models/acao');

var express = require('express');
var mongoose = require('mongoose');
var Log = mongoose.model('Log');
var Acao = mongoose.model('Acao');
var router = express.Router();

router.get('/', function(req, res, next) {
  Log.find(function(err, logs) {
    if(err) return next(err);
    res.json(logs);
  });
});

router.get('/:id', function(req, res, next) {
  var query = Log.findById(req.params.id).populate('acao');

  query.exec(function(err, log) {
    if (err) return next(err);
    if (!log) return next(new Error('log não encontrado'));
    res.json(log);
  });
});

router.post('/', function(req, res, next) {
  var log = new Log(req.body);

  log.save(function(err, log){
    if(err) return next(err);
    res.json(log);
  });
});

router.put('/', function(req, res, next) {
  var query = {'_id': req.body._id};

  Log.findOneAndUpdate(query, req.body, {new: true}, function(err, log) {
    if (err) return next(err);
    if (!log) return next(new Error('log não encontrado'));
    res.json(log);
  });
});

router.delete('/:id', function(req, res, next) {
  var query = Log.findById(req.params.id);

  query.exec(function(err, log) {
    if (err) return next(err);
    if (!log) return next(new Error('log não encontrado'));
    log.remove();
    res.json(log);
  });
});

module.exports = router;
